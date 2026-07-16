import type { SQSEvent } from "aws-lambda";
import {
  type PullRequestJob,
  processPullRequest,
} from "../apps/contractguard-app/lib/check";

export async function handler(event: SQSEvent) {
  const failures: Array<{ itemIdentifier: string }> = [];
  for (const record of event.Records) {
    try {
      await processPullRequest(JSON.parse(record.body) as PullRequestJob);
    } catch (error) {
      console.error("Contract check failed", error);
      failures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures: failures };
}
