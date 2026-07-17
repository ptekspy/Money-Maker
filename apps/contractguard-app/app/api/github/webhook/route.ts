import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { type NextRequest, NextResponse } from "next/server";
import {
  claimWebhook,
  recordFunnelEvent,
  recordOperationalEvent,
  removeInstallation,
  saveInstallation,
  saveRepository,
  setInstallationSuspended,
} from "@/lib/data";
import { requiredEnv } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/github";

export const runtime = "nodejs";
const sqs = new SQSClient({});

type Payload = Record<string, unknown>;

function isPayload(value: unknown): value is Payload {
  return Boolean(value && typeof value === "object");
}

function asPayload(value: unknown): Payload {
  return isPayload(value) ? value : {};
}

function asPayloadArray(value: unknown): Payload[] {
  return Array.isArray(value) ? value.filter(isPayload) : [];
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

async function saveInstallationFromPayload(payload: Payload) {
  const installation = asPayload(payload.installation);
  const repository = asPayload(payload.repository);
  const account = asPayload(installation.account ?? repository.owner);
  const sender = asPayload(payload.sender);
  const installationId = asNumber(installation.id);
  const accountId = asNumber(account.id);
  const accountLogin = asString(account.login);
  if (!installationId || !accountId || !accountLogin) return;

  await saveInstallation({
    installationId,
    accountId,
    accountLogin,
    accountType: asString(account.type) ?? "User",
    repositorySelection:
      asString(installation.repository_selection) ?? "selected",
    installerUserId: asNumber(sender.id),
  });
}

export async function POST(request: NextRequest) {
  const deliveryId = request.headers.get("x-github-delivery");
  const event = request.headers.get("x-github-event");
  let payload: Payload | undefined;

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

    const parsedPayload = asPayload(JSON.parse(body));
    payload = parsedPayload;
    if (event === "installation") {
      const installation = asPayload(parsedPayload.installation);
      const installationId = asNumber(installation.id);
      if (parsedPayload.action === "created") {
        await saveInstallationFromPayload(parsedPayload);
        if (installationId) {
          await recordFunnelEvent({
            type: "installation_created",
            installationId,
            userId: asNumber(asPayload(parsedPayload.sender).id),
            login: asString(asPayload(parsedPayload.sender).login),
            dedupeId: `github-${deliveryId}`,
          });
          await Promise.all(
            asPayloadArray(parsedPayload.repositories).map((repo) =>
              saveRepository({
                installationId,
                repositoryId: asNumber(repo.id) ?? 0,
                fullName: asString(repo.full_name) ?? "",
                private: asBoolean(repo.private) ?? false,
              }),
            ),
          );
        }
      } else if (parsedPayload.action === "deleted" && installationId) {
        await removeInstallation(installationId);
      } else if (
        (parsedPayload.action === "suspend" ||
          parsedPayload.action === "unsuspend") &&
        installationId
      ) {
        await setInstallationSuspended(
          installationId,
          parsedPayload.action === "suspend",
        );
      }
    }

    if (event === "installation_repositories") {
      const installation = asPayload(parsedPayload.installation);
      const installationId = asNumber(installation.id);
      if (installationId) {
        await Promise.all([
          ...asPayloadArray(parsedPayload.repositories_added).map((repo) =>
            saveRepository({
              installationId,
              repositoryId: asNumber(repo.id) ?? 0,
              fullName: asString(repo.full_name) ?? "",
              private: asBoolean(repo.private) ?? false,
            }),
          ),
          ...asPayloadArray(parsedPayload.repositories_removed).map((repo) =>
            saveRepository({
              installationId,
              repositoryId: asNumber(repo.id) ?? 0,
              fullName: asString(repo.full_name) ?? "",
              private: asBoolean(repo.private) ?? false,
              removed: true,
            }),
          ),
        ]);
      }
    }

    if (
      event === "pull_request" &&
      ["opened", "reopened", "synchronize", "ready_for_review"].includes(
        String(parsedPayload.action),
      ) &&
      !asPayload(parsedPayload.pull_request).draft
    ) {
      const installation = asPayload(parsedPayload.installation);
      const repository = asPayload(parsedPayload.repository);
      const pullRequest = asPayload(parsedPayload.pull_request);
      const base = asPayload(pullRequest.base);
      const head = asPayload(pullRequest.head);
      const installationId = asNumber(installation.id);
      const repositoryId = asNumber(repository.id);
      const fullName = asString(repository.full_name);
      const isPrivate = asBoolean(repository.private) ?? false;
      const pullRequestNumber = asNumber(pullRequest.number);
      const baseSha = asString(base.sha);
      const headSha = asString(head.sha);
      if (
        !installationId ||
        !repositoryId ||
        !fullName ||
        !pullRequestNumber ||
        !baseSha ||
        !headSha
      ) {
        throw new Error("Pull request webhook payload is missing fields");
      }
      // Provision defensively here too. This covers installations that existed
      // before a webhook secret was configured or whose installation event was
      // otherwise missed, without delaying the PR check.
      await saveInstallationFromPayload(parsedPayload);
      await saveRepository({
        installationId,
        repositoryId,
        fullName,
        private: isPrivate,
      });
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: requiredEnv("CONTRACTGUARD_QUEUE_URL"),
          MessageBody: JSON.stringify({
            installationId,
            repositoryId,
            fullName,
            private: isPrivate,
            pullRequestNumber,
            baseSha,
            headSha,
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
    await recordOperationalEvent({
      severity: "error",
      source: "webhook",
      message: "GitHub webhook processing failed",
      detail: error instanceof Error ? error.message : String(error),
      installationId: asNumber(asPayload(payload?.installation).id),
      repositoryId: asNumber(asPayload(payload?.repository).id),
      fullName: asString(asPayload(payload?.repository).full_name),
      pullRequestNumber: asNumber(asPayload(payload?.pull_request).number),
    }).catch((eventError) => {
      console.error("Could not record Contract Guard webhook event", {
        eventError,
      });
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
