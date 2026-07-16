import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { type NextRequest, NextResponse } from "next/server";
import {
  claimWebhook,
  removeInstallation,
  saveInstallation,
  saveRepository,
  setInstallationSuspended,
} from "@/lib/data";
import { requiredEnv } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/github";

export const runtime = "nodejs";
const sqs = new SQSClient({});

type Payload = Record<string, any>;

async function saveInstallationFromPayload(payload: Payload) {
  const installation = payload.installation;
  const account = installation?.account ?? payload.repository?.owner;
  if (!installation?.id || !account?.id || !account?.login) return;

  await saveInstallation({
    installationId: installation.id,
    accountId: account.id,
    accountLogin: account.login,
    accountType: account.type ?? "User",
    repositorySelection: installation.repository_selection ?? "selected",
  });
}

export async function POST(request: NextRequest) {
  const deliveryId = request.headers.get("x-github-delivery");
  const event = request.headers.get("x-github-event");

  try {
    const body = await request.text();
    if (
      !verifyWebhookSignature(body, request.headers.get("x-hub-signature-256"))
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    if (!deliveryId || !event)
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    if (!(await claimWebhook(deliveryId)))
      return NextResponse.json({ duplicate: true });

    const payload = JSON.parse(body) as Payload;
    if (event === "installation") {
      if (payload.action === "created") {
        await saveInstallationFromPayload(payload);
        await Promise.all(
          (payload.repositories ?? []).map((repo: Payload) =>
            saveRepository({
              installationId: payload.installation.id,
              repositoryId: repo.id,
              fullName: repo.full_name,
              private: repo.private,
            }),
          ),
        );
      } else if (payload.action === "deleted") {
        await removeInstallation(payload.installation.id);
      } else if (
        payload.action === "suspend" ||
        payload.action === "unsuspend"
      ) {
        await setInstallationSuspended(
          payload.installation.id,
          payload.action === "suspend",
        );
      }
    }

    if (event === "installation_repositories") {
      await Promise.all([
        ...(payload.repositories_added ?? []).map((repo: Payload) =>
          saveRepository({
            installationId: payload.installation.id,
            repositoryId: repo.id,
            fullName: repo.full_name,
            private: repo.private,
          }),
        ),
        ...(payload.repositories_removed ?? []).map((repo: Payload) =>
          saveRepository({
            installationId: payload.installation.id,
            repositoryId: repo.id,
            fullName: repo.full_name,
            private: repo.private,
            removed: true,
          }),
        ),
      ]);
    }

    if (
      event === "pull_request" &&
      ["opened", "reopened", "synchronize", "ready_for_review"].includes(
        payload.action,
      ) &&
      !payload.pull_request.draft
    ) {
      // Provision defensively here too. This covers installations that existed
      // before a webhook secret was configured or whose installation event was
      // otherwise missed, without delaying the PR check.
      await saveInstallationFromPayload(payload);
      await saveRepository({
        installationId: payload.installation.id,
        repositoryId: payload.repository.id,
        fullName: payload.repository.full_name,
        private: payload.repository.private,
      });
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: requiredEnv("CONTRACTGUARD_QUEUE_URL"),
          MessageBody: JSON.stringify({
            installationId: payload.installation.id,
            repositoryId: payload.repository.id,
            fullName: payload.repository.full_name,
            private: payload.repository.private,
            pullRequestNumber: payload.pull_request.number,
            baseSha: payload.pull_request.base.sha,
            headSha: payload.pull_request.head.sha,
          }),
        }),
      );
    }

    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch (error) {
    console.error("Contract Guard webhook failed", {
      deliveryId,
      event,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
