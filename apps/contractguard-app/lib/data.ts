import { createHash, randomBytes, randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { requiredEnv } from "@/lib/env";
import type { BillingPlan } from "@/lib/plans";

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
  installerUserId?: number;
  repositorySelection: string;
  createdAt: string;
  trialEndsAt: string;
  billingStatus: BillingStatus;
  billingPlan?: BillingPlan;
  billingProvider?: "stripe" | "github_marketplace";
  githubMarketplacePlanId?: number;
  githubMarketplaceEffectiveAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planTrialEndsAt?: string;
  proTrialStartedAt?: string;
  workspaceId?: string;
  suspendedAt?: string;
};

export type MarketplacePurchase = {
  pk: string;
  sk: "PROFILE";
  accountId: number;
  accountLogin: string;
  billingStatus: BillingStatus;
  billingPlan: BillingPlan;
  githubMarketplacePlanId: number;
  effectiveAt: string;
  trialEndsAt?: string;
  updatedAt: string;
};

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "developer"
  | "billing"
  | "viewer";

export type Workspace = {
  pk: string;
  sk: "PROFILE";
  workspaceId: string;
  name: string;
  ownerUserId: number;
  billingStatus: BillingStatus;
  billingPlan: "teams";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSeatSubscriptionItemId?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  pk: string;
  sk: string;
  workspaceId: string;
  userId: number;
  login: string;
  email?: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export type WorkspaceInvitation = {
  pk: string;
  sk: string;
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  invitedByUserId: number;
  createdAt: string;
  expiresAt: number;
  acceptedAt?: string;
};

export type WorkspaceAuditEvent = {
  pk: string;
  sk: string;
  workspaceId: string;
  actorUserId?: number;
  action: string;
  detail?: string;
  createdAt: string;
};

export type UserProfile = {
  pk: string;
  sk: "PROFILE";
  userId: number;
  login: string;
  email?: string;
  source?: string;
  campaign?: string;
  createdAt: string;
  lastSignedInAt: string;
};

export type FunnelEventType =
  | "checker_run"
  | "install_cta_clicked"
  | "github_sign_in"
  | "installation_created"
  | "check_completed"
  | "checkout_started"
  | "subscription_activated";

export type FunnelEvent = {
  pk: string;
  sk: string;
  type: FunnelEventType;
  createdAt: string;
  source?: string;
  campaign?: string;
  userId?: number;
  login?: string;
  installationId?: number;
  repositoryId?: number;
};

export type RepositoryRecord = {
  pk: string;
  sk: string;
  installationId: number;
  repositoryId: number;
  fullName: string;
  private: boolean;
  removed?: boolean;
  firstSeenAt?: string;
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
  installerUserId?: number;
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
          billingPlan: "starter",
        } satisfies Installation & { gsi1pk: string; gsi1sk: string },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    )
    .catch(async (error: { name?: string }) => {
      if (error.name !== "ConditionalCheckFailedException") throw error;
      if (input.installerUserId) {
        await db.send(
          new UpdateCommand({
            TableName: tableName(),
            Key: {
              pk: `INSTALLATION#${input.installationId}`,
              sk: "PROFILE",
            },
            UpdateExpression:
              "SET installerUserId = if_not_exists(installerUserId, :userId)",
            ExpressionAttributeValues: {
              ":userId": input.installerUserId,
            },
          }),
        );
      }
    });

  const marketplacePurchase = await getMarketplacePurchase(input.accountId);
  if (marketplacePurchase) {
    await updateInstallationMarketplaceBilling(
      input.installationId,
      marketplacePurchase,
    );
  }
}

export async function getMarketplacePurchase(accountId: number) {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: `MARKETPLACE_ACCOUNT#${accountId}`, sk: "PROFILE" },
    }),
  );
  return (result.Item as MarketplacePurchase | undefined) ?? null;
}

async function updateInstallationMarketplaceBilling(
  installationId: number,
  purchase: MarketplacePurchase,
) {
  try {
    await db.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `INSTALLATION#${installationId}`, sk: "PROFILE" },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression:
          "SET billingStatus = :status, billingPlan = :plan, billingProvider = :provider, githubMarketplacePlanId = :planId, githubMarketplaceEffectiveAt = :effectiveAt, trialEndsAt = :trialEnd",
        ExpressionAttributeValues: {
          ":status": purchase.billingStatus,
          ":plan": purchase.billingPlan,
          ":provider": "github_marketplace",
          ":planId": purchase.githubMarketplacePlanId,
          ":effectiveAt": purchase.effectiveAt,
          ":trialEnd": purchase.trialEndsAt ?? "",
        },
      }),
    );
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return false;
    throw error;
  }
}

export async function saveMarketplacePurchase(input: {
  accountId: number;
  accountLogin: string;
  billingStatus: BillingStatus;
  billingPlan: BillingPlan;
  githubMarketplacePlanId: number;
  effectiveAt: string;
  trialEndsAt?: string;
}) {
  const purchase: MarketplacePurchase = {
    pk: `MARKETPLACE_ACCOUNT#${input.accountId}`,
    sk: "PROFILE",
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: purchase,
    }),
  );

  const installations = await getInstallationsForAccount(input.accountId);
  await Promise.all(
    installations.map((installation) =>
      updateInstallationMarketplaceBilling(
        installation.installationId,
        purchase,
      ),
    ),
  );
  return installations.length;
}

export async function saveUserProfile(input: {
  userId: number;
  login: string;
  email?: string;
  source?: string;
  campaign?: string;
}) {
  const now = new Date().toISOString();
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: `USER#${input.userId}`, sk: "PROFILE" },
      UpdateExpression:
        "SET userId = :userId, login = :login, email = :email, #source = if_not_exists(#source, :source), campaign = if_not_exists(campaign, :campaign), createdAt = if_not_exists(createdAt, :now), lastSignedInAt = :now",
      ExpressionAttributeNames: { "#source": "source" },
      ExpressionAttributeValues: {
        ":userId": input.userId,
        ":login": input.login,
        ":email": input.email ?? "",
        ":source": input.source ?? "direct",
        ":campaign": input.campaign ?? "",
        ":now": now,
      },
    }),
  );
}

export async function getUserProfile(
  userId: number,
): Promise<UserProfile | null> {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: `USER#${userId}`, sk: "PROFILE" },
    }),
  );
  return (result.Item as UserProfile | undefined) ?? null;
}

function workspacePk(workspaceId: string) {
  return `WORKSPACE#${workspaceId}`;
}

function invitationHash(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export async function createWorkspace(input: {
  name: string;
  ownerUserId: number;
  ownerLogin: string;
  ownerEmail?: string;
}) {
  const workspaceId = randomUUID();
  const now = new Date().toISOString();
  const workspace: Workspace = {
    pk: workspacePk(workspaceId),
    sk: "PROFILE",
    workspaceId,
    name: input.name.trim().slice(0, 80) || `${input.ownerLogin}'s team`,
    ownerUserId: input.ownerUserId,
    billingStatus: "cancelled",
    billingPlan: "teams",
    createdAt: now,
    updatedAt: now,
  };
  const owner: WorkspaceMember & { gsi1pk: string; gsi1sk: string } = {
    pk: workspace.pk,
    sk: `MEMBER#${input.ownerUserId}`,
    workspaceId,
    userId: input.ownerUserId,
    login: input.ownerLogin,
    email: input.ownerEmail,
    role: "owner",
    joinedAt: now,
    gsi1pk: `USER#${input.ownerUserId}`,
    gsi1sk: `WORKSPACE#${workspaceId}`,
  };
  await Promise.all([
    db.send(
      new PutCommand({
        TableName: tableName(),
        Item: workspace,
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    ),
    db.send(
      new PutCommand({
        TableName: tableName(),
        Item: owner,
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    ),
  ]);
  await recordWorkspaceAudit({
    workspaceId,
    actorUserId: input.ownerUserId,
    action: "workspace.created",
    detail: workspace.name,
  });
  return workspace;
}

export async function getWorkspace(
  workspaceId: string,
): Promise<Workspace | null> {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: workspacePk(workspaceId), sk: "PROFILE" },
    }),
  );
  return (result.Item as Workspace | undefined) ?? null;
}

export async function getWorkspaceMember(
  workspaceId: string,
  userId: number,
): Promise<WorkspaceMember | null> {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: workspacePk(workspaceId), sk: `MEMBER#${userId}` },
    }),
  );
  return (result.Item as WorkspaceMember | undefined) ?? null;
}

export async function listWorkspaceMembers(workspaceId: string) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": workspacePk(workspaceId),
        ":prefix": "MEMBER#",
      },
      ScanIndexForward: true,
    }),
  );
  return (result.Items ?? []) as WorkspaceMember[];
}

export async function listUserWorkspaces(userId: number) {
  const memberships = await db.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: "LookupIndex",
      KeyConditionExpression: "gsi1pk = :user",
      ExpressionAttributeValues: { ":user": `USER#${userId}` },
    }),
  );
  const members = (memberships.Items ?? []).filter((item) =>
    String(item.sk ?? "").startsWith("MEMBER#"),
  ) as WorkspaceMember[];
  const workspaces = await Promise.all(
    members.map((member) => getWorkspace(member.workspaceId)),
  );
  return members.flatMap((member, index) => {
    const workspace = workspaces[index];
    return workspace ? [{ member, workspace }] : [];
  });
}

export async function createWorkspaceInvitation(input: {
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  invitedByUserId: number;
}) {
  const secret = randomBytes(32).toString("base64url");
  const now = new Date();
  const invitation: WorkspaceInvitation = {
    pk: workspacePk(input.workspaceId),
    sk: `INVITE#${invitationHash(secret)}`,
    workspaceId: input.workspaceId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    invitedByUserId: input.invitedByUserId,
    createdAt: now.toISOString(),
    expiresAt: Math.floor(now.getTime() / 1000) + 60 * 60 * 24 * 7,
  };
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: invitation,
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
  return {
    invitation,
    token: `${input.workspaceId}.${secret}`,
  };
}

export async function getWorkspaceInvitation(token: string) {
  const [workspaceId, secret] = token.split(".", 2);
  if (!workspaceId || !secret) return null;
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: {
        pk: workspacePk(workspaceId),
        sk: `INVITE#${invitationHash(secret)}`,
      },
    }),
  );
  return (result.Item as WorkspaceInvitation | undefined) ?? null;
}

export async function acceptWorkspaceInvitation(input: {
  token: string;
  userId: number;
  login: string;
  email: string;
}) {
  const invitation = await getWorkspaceInvitation(input.token);
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.expiresAt <= Math.floor(Date.now() / 1000) ||
    invitation.email !== input.email.trim().toLowerCase()
  )
    return null;
  const now = new Date().toISOString();
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: workspacePk(invitation.workspaceId),
        sk: `MEMBER#${input.userId}`,
        workspaceId: invitation.workspaceId,
        userId: input.userId,
        login: input.login,
        email: input.email,
        role: invitation.role,
        joinedAt: now,
        gsi1pk: `USER#${input.userId}`,
        gsi1sk: `WORKSPACE#${invitation.workspaceId}`,
      } satisfies WorkspaceMember & { gsi1pk: string; gsi1sk: string },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { pk: invitation.pk, sk: invitation.sk },
      UpdateExpression: "SET acceptedAt = :now",
      ConditionExpression: "attribute_not_exists(acceptedAt)",
      ExpressionAttributeValues: { ":now": now },
    }),
  );
  await recordWorkspaceAudit({
    workspaceId: invitation.workspaceId,
    actorUserId: input.userId,
    action: "member.joined",
    detail: `${input.login} (${invitation.role})`,
  });
  return invitation;
}

export async function updateWorkspaceMemberRole(input: {
  workspaceId: string;
  userId: number;
  role: Exclude<WorkspaceRole, "owner">;
  actorUserId: number;
}) {
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: {
        pk: workspacePk(input.workspaceId),
        sk: `MEMBER#${input.userId}`,
      },
      UpdateExpression: "SET #role = :role",
      ConditionExpression: "attribute_exists(pk) AND #role <> :owner",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: {
        ":role": input.role,
        ":owner": "owner",
      },
    }),
  );
  await recordWorkspaceAudit({
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    action: "member.role_changed",
    detail: `${input.userId} -> ${input.role}`,
  });
}

export async function removeWorkspaceMember(input: {
  workspaceId: string;
  userId: number;
  actorUserId: number;
}) {
  const member = await getWorkspaceMember(input.workspaceId, input.userId);
  if (!member || member.role === "owner") return false;
  await db.send(
    new DeleteCommand({
      TableName: tableName(),
      Key: {
        pk: workspacePk(input.workspaceId),
        sk: `MEMBER#${input.userId}`,
      },
    }),
  );
  await recordWorkspaceAudit({
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    action: "member.removed",
    detail: `${member.login} (${member.role})`,
  });
  return true;
}

export async function recordWorkspaceAudit(input: {
  workspaceId: string;
  actorUserId?: number;
  action: string;
  detail?: string;
}) {
  const now = new Date().toISOString();
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: workspacePk(input.workspaceId),
        sk: `AUDIT#${now}#${randomUUID()}`,
        ...input,
        createdAt: now,
      } satisfies WorkspaceAuditEvent,
    }),
  );
}

export async function listWorkspaceAudit(workspaceId: string, limit = 30) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": workspacePk(workspaceId),
        ":prefix": "AUDIT#",
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (result.Items ?? []) as WorkspaceAuditEvent[];
}

function funnelPartition(date: Date) {
  return `FUNNEL#${date.toISOString().slice(0, 7)}`;
}

export async function recordFunnelEvent(input: {
  type: FunnelEventType;
  source?: string;
  campaign?: string;
  userId?: number;
  login?: string;
  installationId?: number;
  repositoryId?: number;
  dedupeId?: string;
}) {
  const now = new Date();
  await db
    .send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: funnelPartition(now),
          sk: input.dedupeId
            ? `EVENT#DEDUPE#${input.dedupeId}`
            : `EVENT#${now.toISOString()}#${randomUUID()}`,
          ...input,
          createdAt: now.toISOString(),
        } satisfies FunnelEvent & { dedupeId?: string },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    )
    .catch((error: { name?: string }) => {
      if (error.name !== "ConditionalCheckFailedException") throw error;
    });
}

export async function listFunnelEventsSince(since: Date) {
  const now = new Date();
  const partitions: string[] = [];
  const cursor = new Date(
    Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), 1),
  );
  while (cursor <= now) {
    partitions.push(funnelPartition(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const results = await Promise.all(
    partitions.map((pk) =>
      db.send(
        new QueryCommand({
          TableName: tableName(),
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
          ExpressionAttributeValues: { ":pk": pk, ":prefix": "EVENT#" },
          ScanIndexForward: false,
          Limit: 1000,
        }),
      ),
    ),
  );
  return results
    .flatMap((result) => (result.Items ?? []) as FunnelEvent[])
    .filter((event) => Date.parse(event.createdAt) >= since.getTime())
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function emailWasSent(ownerKey: string, kind: string) {
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: ownerKey, sk: `EMAIL#${kind}` },
    }),
  );
  return Boolean(result.Item);
}

export async function markEmailSent(ownerKey: string, kind: string) {
  await db.send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        pk: ownerKey,
        sk: `EMAIL#${kind}`,
        sentAt: new Date().toISOString(),
      },
    }),
  );
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

export async function linkInstallationToWorkspace(input: {
  workspaceId: string;
  installationId: number;
  actorUserId: number;
}) {
  const installation = await getInstallation(input.installationId);
  if (
    !installation ||
    (installation.workspaceId && installation.workspaceId !== input.workspaceId)
  )
    return false;
  await Promise.all([
    db.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: {
          pk: `INSTALLATION#${input.installationId}`,
          sk: "PROFILE",
        },
        UpdateExpression: "SET workspaceId = :workspaceId",
        ExpressionAttributeValues: { ":workspaceId": input.workspaceId },
      }),
    ),
    db.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: workspacePk(input.workspaceId),
          sk: `INSTALLATION#${input.installationId}`,
          workspaceId: input.workspaceId,
          installationId: input.installationId,
          accountLogin: installation.accountLogin,
          linkedAt: new Date().toISOString(),
        },
      }),
    ),
  ]);
  await recordWorkspaceAudit({
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    action: "installation.linked",
    detail: installation.accountLogin,
  });
  return true;
}

export async function listWorkspaceInstallations(workspaceId: string) {
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": workspacePk(workspaceId),
        ":prefix": "INSTALLATION#",
      },
    }),
  );
  const links = (result.Items ?? []) as Array<{ installationId: number }>;
  const installations = await Promise.all(
    links.map((link) => getInstallation(link.installationId)),
  );
  return installations.filter((installation): installation is Installation =>
    Boolean(installation),
  );
}

export async function listWorkspaceRepositories(workspaceId: string) {
  const installations = await listWorkspaceInstallations(workspaceId);
  const repositories = await Promise.all(
    installations.map((installation) =>
      listRepositories(installation.installationId),
    ),
  );
  return repositories.flat().filter((repository) => !repository.removed);
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
      FilterExpression:
        "sk = :profile AND attribute_exists(installationId) AND attribute_exists(accountLogin)",
      ExpressionAttributeValues: { ":profile": "PROFILE" },
      Limit: limit,
    }),
  );
  return (result.Items ?? []).filter(
    (item) =>
      Number.isSafeInteger(item.installationId) &&
      Number(item.installationId) > 0 &&
      typeof item.accountLogin === "string" &&
      item.accountLogin.trim().length > 0,
  ) as Installation[];
}

export async function listAllWorkspaces(limit = 100) {
  const result = await db.send(
    new ScanCommand({
      TableName: tableName(),
      FilterExpression:
        "sk = :profile AND attribute_exists(workspaceId) AND billingPlan = :plan",
      ExpressionAttributeValues: {
        ":profile": "PROFILE",
        ":plan": "teams",
      },
      Limit: limit,
    }),
  );
  return (result.Items ?? []) as Workspace[];
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
  const now = new Date().toISOString();
  await db.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: {
        pk: `INSTALLATION#${input.installationId}`,
        sk: `REPOSITORY#${input.repositoryId}`,
      },
      UpdateExpression:
        "SET installationId = :installationId, repositoryId = :repositoryId, fullName = :fullName, #private = :private, removed = :removed, firstSeenAt = if_not_exists(firstSeenAt, :now), updatedAt = :now",
      ExpressionAttributeNames: {
        "#private": "private",
      },
      ExpressionAttributeValues: {
        ":installationId": input.installationId,
        ":repositoryId": input.repositoryId,
        ":fullName": input.fullName,
        ":private": input.private,
        ":removed": input.removed ?? false,
        ":now": now,
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
  await recordFunnelEvent({
    type: "check_completed",
    installationId: input.installationId,
    repositoryId: input.repositoryId,
    dedupeId: `check-${input.headSha}`,
  });
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
  billingPlan: BillingPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planTrialEndsAt?: string;
  proTrialStarted?: boolean;
}) {
  const updateExpression = [
    "SET billingStatus = :status",
    "billingPlan = :plan",
    "billingProvider = :provider",
    "stripeCustomerId = :customer",
    "stripeSubscriptionId = :subscription",
    "planTrialEndsAt = :trialEnd",
    input.proTrialStarted
      ? "proTrialStartedAt = if_not_exists(proTrialStartedAt, :now)"
      : "",
  ]
    .filter(Boolean)
    .join(", ");
  try {
    await db.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `INSTALLATION#${input.installationId}`, sk: "PROFILE" },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":status": input.billingStatus,
          ":plan": input.billingPlan,
          ":provider": "stripe",
          ":customer": input.stripeCustomerId ?? "",
          ":subscription": input.stripeSubscriptionId ?? "",
          ":trialEnd": input.planTrialEndsAt ?? "",
          ...(input.proTrialStarted
            ? { ":now": new Date().toISOString() }
            : {}),
        },
      }),
    );
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return false;
    throw error;
  }
}

export async function updateWorkspaceBilling(input: {
  workspaceId: string;
  billingStatus: BillingStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSeatSubscriptionItemId?: string;
  trialEndsAt?: string;
}) {
  try {
    await db.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: workspacePk(input.workspaceId), sk: "PROFILE" },
        ConditionExpression: "attribute_exists(pk)",
        UpdateExpression:
          "SET billingStatus = :status, stripeCustomerId = :customer, stripeSubscriptionId = :subscription, stripeSeatSubscriptionItemId = :seatItem, trialEndsAt = :trialEnd, updatedAt = :now",
        ExpressionAttributeValues: {
          ":status": input.billingStatus,
          ":customer": input.stripeCustomerId ?? "",
          ":subscription": input.stripeSubscriptionId ?? "",
          ":seatItem": input.stripeSeatSubscriptionItemId ?? "",
          ":trialEnd": input.trialEndsAt ?? "",
          ":now": new Date().toISOString(),
        },
      }),
    );
    const installations = await listWorkspaceInstallations(input.workspaceId);
    await Promise.all(
      installations.map((installation) =>
        updateBilling({
          installationId: installation.installationId,
          billingStatus: input.billingStatus,
          billingPlan: "teams",
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          planTrialEndsAt: input.trialEndsAt,
        }),
      ),
    );
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return false;
    throw error;
  }
}

export function hasEntitlement(installation: Installation | null): boolean {
  if (!installation || installation.suspendedAt) return false;
  if (installation.billingStatus === "active") return true;
  const trialEnd = Math.max(
    ...[installation.trialEndsAt, installation.planTrialEndsAt]
      .map((value) => Date.parse(value ?? ""))
      .filter(Number.isFinite),
    0,
  );
  return installation.billingStatus === "trialing" && trialEnd > Date.now();
}
