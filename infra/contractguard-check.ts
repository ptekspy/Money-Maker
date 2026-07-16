import type { SQSEvent } from "aws-lambda";
import {
  type PullRequestJob,
  processPullRequest,
} from "../apps/contractguard-app/lib/check";
import { recordOperationalEvent } from "../apps/contractguard-app/lib/data";

export async function handler(event: SQSEvent) {
  const failures: Array<{ itemIdentifier: string }> = [];
  for (const record of event.Records) {
    let job: PullRequestJob | undefined;
    try {
      job = JSON.parse(record.body) as PullRequestJob;
      await processPullRequest(job);
    } catch (error) {
      console.error("Contract check failed", error);
      await recordOperationalEvent({
        severity: "error",
        source: "worker",
        message: "Contract check failed",
        detail: error instanceof Error ? error.message : String(error),
        installationId: job?.installationId,
        repositoryId: job?.repositoryId,
        fullName: job?.fullName,
        pullRequestNumber: job?.pullRequestNumber,
      }).catch((eventError) => {
        console.error("Could not record Contract Guard operational event", {
          eventError,
        });
      });
      failures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures: failures };
}
