import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { requiredEnv } from "@/lib/env";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

export type BillingStatus = "trialing" | "active" | "past_due" | "cancelled";

export type Installation = {
  pk: string;
  sk: "PROFILE";
  installationId: number;
  accountId: number;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  createdAt: string;
  trialEndsAt: string;
  billingStatus: BillingStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  suspendedAt?: string;
};

export type RepositoryRecord = {
  pk: string;
  sk: string;
  installationId: number;
  repositoryId: number;
  fullName: string;
  private: boolean;
  removed?: boolean;
  updatedAt: string;
};

export type CheckRecord = {
  pk: string;
  sk: string;
  installationId: number;
  repositoryId: number;
  fullName: string;
  pullRequestNumber: number;
  headSha: string;
  conclusion: string;
  breakingChanges: number;
  specPath?: string;
  createdAt: string;
};

export type OperationalEvent = {
  pk: "OPS";
  sk: string;
  severity: "info" | "warning" | "error";
  source: "webhook" | "worker" | "billing";
  message: string;
  detail?: string;
  installationId?: number;
  repositoryId?: number;
  fullName?: string;
  pullRequestNumber?: number;
  createdAt: string;
};

function tableName() {
  return requiredEnv("CONTRACTGUARD_TABLE_NAME");
}

export async function saveInstallation(input: {
  installationId: number;
  accountId: number;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
}) {
  const now = new Date();
  const trialEnds = new Date(now);
  trialEnds.setUTCDate(trialEnds.getUTCDate() + 14);

  await db
    .send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `INSTALLATION#${input.installationId}`,
          sk: "PROFILE",
          gsi1pk: `ACCOUNT#${input.accountId}`,
          gsi1sk: `INSTALLATION#${input.installationId}`,
          ...input,
          createdAt: now.toISOString(),
          trialEndsAt: trialEnds.toISOString(),
          billingStatus: "trialing",
        } satisfies Installation & { gsi1pk: string; gsi1sk: string },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    )
    .catch((error: { name?: string }) => {
      if (error.name !== "ConditionalCheckFailedException") throw error;
    });
}

export async function getInstallation(
  installationId: number,
): Promise<Installation | null> {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: `INSTALLATION#${installationId}`, sk: "PROFILE" },
    }),
  );
  return (result.Item as Installation | undefined) ?? null;
}

export async function getInstallationsForAccount(
  accountId: number,
): Promise<Installation[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: "LookupIndex",
      KeyConditionExpression: "gsi1pk = :account",
      ExpressionAttributeValues: { ":account": `ACCOUNT#${accountId}` },
    }),
  );
  return (result.Items ?? []) as Installation[];
}

export async function listAllInstallations(limit = 100) {
  const result = await db.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression: "sk = :profile",
      ExpressionAttributeValues: { ":profile": "PROFILE" },
      Limit: limit,
    }),
  );
  return (result.Items ?? []) as Installation[];
}

export async function setInstallationSuspended(
  installationId: number,
  suspended: boolean,
) {
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: `INSTALLATION#${installationId}`, sk: "PROFILE" },
      UpdateExpression: "SET suspendedAt = :value",
      ExpressionAttributeValues: {
        ":value": suspended ? new Date().toISOString() : "",
      },
    }),
  );
}

export async function removeInstallation(installationId: number) {
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: `INSTALLATION#${installationId}`, sk: "PROFILE" },
      UpdateExpression: "SET billingStatus = :status, suspendedAt = :now",
      ExpressionAttributeValues: {
        ":status": "cancelled",
        ":now": new Date().toISOString(),
      },
    }),
  );
}

export async function saveRepository(input: {
  installationId: number;
  repositoryId: number;
  fullName: string;
  private: boolean;
  removed?: boolean;
}) {
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: `INSTALLATION#${input.installationId}`,
        sk: `REPOSITORY#${input.repositoryId}`,
        ...input,
        updatedAt: new Date().toISOString(),
      },
    }),
  );
}

export async function listRepositories(installationId: number) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `INSTALLATION#${installationId}`,
        ":prefix": "REPOSITORY#",
      },
      ScanIndexForward: false,
      Limit: 100,
    }),
  );
  return (result.Items ?? []) as RepositoryRecord[];
}

export async function recordCheck(input: {
  installationId: number;
  repositoryId: number;
  fullName: string;
  pullRequestNumber: number;
  headSha: string;
  conclusion: string;
  breakingChanges: number;
  specPath?: string;
}) {
  const now = new Date();
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: `INSTALLATION#${input.installationId}`,
        sk: `CHECK#${now.toISOString()}#${input.headSha}`,
        ...input,
        createdAt: now.toISOString(),
      },
    }),
  );
}

export async function recordOperationalEvent(input: {
  severity: OperationalEvent["severity"];
  source: OperationalEvent["source"];
  message: string;
  detail?: string;
  installationId?: number;
  repositoryId?: number;
  fullName?: string;
  pullRequestNumber?: number;
}) {
  const now = new Date().toISOString();
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: "OPS",
        sk: `EVENT#${now}#${randomUUID()}`,
        ...input,
        createdAt: now,
      } satisfies OperationalEvent,
    }),
  );
}

export async function listRecentOperationalEvents(limit = 10) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": "OPS",
        ":prefix": "EVENT#",
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (result.Items ?? []) as OperationalEvent[];
}

export async function listRecentChecks(installationId: number) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `INSTALLATION#${installationId}`,
        ":prefix": "CHECK#",
      },
      ScanIndexForward: false,
      Limit: 20,
    }),
  );
  return (result.Items ?? []) as CheckRecord[];
}

export async function claimWebhook(deliveryId: string): Promise<boolean> {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  try {
    await db.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `DELIVERY#${deliveryId}`,
          sk: "EVENT",
          createdAt: new Date().toISOString(),
          expiresAt,
        },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    );
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return false;
    throw error;
  }
}

export async function updateBilling(input: {
  installationId: number;
  billingStatus: BillingStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: `INSTALLATION#${input.installationId}`, sk: "PROFILE" },
      UpdateExpression:
        "SET billingStatus = :status, stripeCustomerId = :customer, stripeSubscriptionId = :subscription",
      ExpressionAttributeValues: {
        ":status": input.billingStatus,
        ":customer": input.stripeCustomerId ?? "",
        ":subscription": input.stripeSubscriptionId ?? "",
      },
    }),
  );
}

export function hasEntitlement(installation: Installation | null): boolean {
  if (!installation || installation.suspendedAt) return false;
  if (installation.billingStatus === "active") return true;
  return (
    installation.billingStatus === "trialing" &&
    Date.parse(installation.trialEndsAt) > Date.now()
  );
}
