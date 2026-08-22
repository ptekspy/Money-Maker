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

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const tableName = process.env.LETDUE_TABLE_NAME ?? "letdue-local";

export type LetDueUser = {
  id: string;
  email: string;
  accessToken: string;
  stripeCustomerId?: string;
  subscriptionStatus: "active" | "cancelled" | "past_due";
  plan?: "pilot" | "paid";
  pilotEndsAt?: string;
  acquisitionSource?: string;
  propertyLimit?: number;
  adminSuspendedAt?: string;
};

export function hasActiveAccess(user: LetDueUser, now = new Date()) {
  if (user.adminSuspendedAt) return false;
  if (user.subscriptionStatus !== "active") return false;
  if (user.plan !== "pilot") return true;
  return Boolean(user.pilotEndsAt && new Date(user.pilotEndsAt) > now);
}

export function propertyLimitForUser(user: LetDueUser) {
  return Math.max(1, Math.min(100, user.propertyLimit ?? 3));
}

export type LetDueProperty = {
  id: string;
  userId: string;
  address: string;
  hasGas: boolean;
  isHmo: boolean;
  createdAt: string;
};

export type LetDueCertificate = {
  id: string;
  propertyId: string;
  userId: string;
  kind: string;
  expiryDate: string | null;
  documentKey?: string;
};

export type LetDueSupportRequest = {
  id: string;
  createdAt: string;
  source: "public" | "dashboard";
  name?: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  context?: string;
};

async function getItem<T>(pk: string, sk: string) {
  const result = await client.send(
    new GetCommand({ TableName: tableName, Key: { pk, sk } }),
  );
  return (result.Item as T | undefined) ?? null;
}

async function lookupUserId(kind: string, value: string) {
  const item = await getItem<{ userId: string }>(`${kind}#${value}`, "LOOKUP");
  return item?.userId ?? null;
}

export async function getUserByToken(token: string) {
  const userId = await lookupUserId("TOKEN", token);
  if (!userId) return null;
  return getItem<LetDueUser>(`USER#${userId}`, "PROFILE");
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const userId = await lookupUserId("EMAIL", normalizedEmail);
  if (!userId) return null;
  return getItem<LetDueUser>(`USER#${userId}`, "PROFILE");
}

export async function getUser(userId: string) {
  return getItem<LetDueUser>(`USER#${userId}`, "PROFILE");
}

export async function getUserByCustomerId(customerId: string) {
  const userId = await lookupUserId("CUSTOMER", customerId);
  if (!userId) return null;
  return getItem<LetDueUser>(`USER#${userId}`, "PROFILE");
}

export async function activateCustomer(input: {
  email: string;
  stripeCustomerId: string;
  stripeSessionId: string;
  address: string;
  hasGas: boolean;
  isHmo: boolean;
  dates: Record<string, string>;
}) {
  const existingSession = await getItem<{ userId: string; propertyId: string }>(
    `SESSION#${input.stripeSessionId}`,
    "LOOKUP",
  );
  if (existingSession) {
    const user = await getItem<LetDueUser>(
      `USER#${existingSession.userId}`,
      "PROFILE",
    );
    const property = await getItem<LetDueProperty>(
      `USER#${existingSession.userId}`,
      `PROPERTY#${existingSession.propertyId}`,
    );
    if (user && property) return { user, property };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUserId = await lookupUserId("EMAIL", normalizedEmail);
  const userId = existingUserId ?? crypto.randomUUID();
  const currentUser = existingUserId
    ? await getItem<LetDueUser>(`USER#${userId}`, "PROFILE")
    : null;
  const user: LetDueUser = {
    id: userId,
    email: normalizedEmail,
    accessToken: currentUser?.accessToken ?? crypto.randomUUID(),
    stripeCustomerId: input.stripeCustomerId,
    subscriptionStatus: "active",
    plan: "paid",
  };
  const property: LetDueProperty = {
    id: crypto.randomUUID(),
    userId,
    address: input.address,
    hasGas: input.hasGas,
    isHmo: input.isHmo,
    createdAt: new Date().toISOString(),
  };

  await Promise.all([
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: { pk: `USER#${userId}`, sk: "PROFILE", ...user },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `EMAIL#${normalizedEmail}`,
          sk: "LOOKUP",
          userId,
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `TOKEN#${user.accessToken}`,
          sk: "LOOKUP",
          userId,
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `CUSTOMER#${input.stripeCustomerId}`,
          sk: "LOOKUP",
          userId,
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `SESSION#${input.stripeSessionId}`,
          sk: "LOOKUP",
          userId,
          propertyId: property.id,
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `USER#${userId}`,
          sk: `PROPERTY#${property.id}`,
          ...property,
        },
      }),
    ),
  ]);

  await Promise.all(
    Object.entries(input.dates)
      .filter(([, expiryDate]) => Boolean(expiryDate))
      .map(([kind, expiryDate]) =>
        saveCertificate({
          userId,
          propertyId: property.id,
          kind,
          expiryDate,
        }),
      ),
  );
  return { user, property };
}

export async function activatePilot(input: {
  email: string;
  address: string;
  hasGas: boolean;
  isHmo: boolean;
  source: string;
  dates: Record<string, string>;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (await lookupUserId("EMAIL", normalizedEmail)) return null;

  const userId = crypto.randomUUID();
  const pilotEndsAt = new Date(Date.now() + 14 * 86_400_000).toISOString();
  const user: LetDueUser = {
    id: userId,
    email: normalizedEmail,
    accessToken: crypto.randomUUID(),
    subscriptionStatus: "active",
    plan: "pilot",
    pilotEndsAt,
    acquisitionSource: input.source,
  };
  const property: LetDueProperty = {
    id: crypto.randomUUID(),
    userId,
    address: input.address,
    hasGas: input.hasGas,
    isHmo: input.isHmo,
    createdAt: new Date().toISOString(),
  };

  await Promise.all([
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `USER#${userId}`,
          sk: "PROFILE",
          gsi1pk: `PILOT#${pilotEndsAt.slice(0, 10)}`,
          gsi1sk: `USER#${userId}`,
          ...user,
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: { pk: `EMAIL#${normalizedEmail}`, sk: "LOOKUP", userId },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: { pk: `TOKEN#${user.accessToken}`, sk: "LOOKUP", userId },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `USER#${userId}`,
          sk: `PROPERTY#${property.id}`,
          ...property,
        },
      }),
    ),
  ]);

  await Promise.all(
    Object.entries(input.dates)
      .filter(([, expiryDate]) => Boolean(expiryDate))
      .map(([kind, expiryDate]) =>
        saveCertificate({
          userId,
          propertyId: property.id,
          kind,
          expiryDate,
        }),
      ),
  );

  return { user, property };
}

export async function activatePilotSubscription(input: {
  userId: string;
  stripeCustomerId: string;
}) {
  await Promise.all([
    client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { pk: `USER#${input.userId}`, sk: "PROFILE" },
        UpdateExpression:
          "set stripeCustomerId = :customer, subscriptionStatus = :status, #plan = :plan remove pilotEndsAt, gsi1pk, gsi1sk",
        ExpressionAttributeNames: { "#plan": "plan" },
        ExpressionAttributeValues: {
          ":customer": input.stripeCustomerId,
          ":status": "active",
          ":plan": "paid",
        },
      }),
    ),
    client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `CUSTOMER#${input.stripeCustomerId}`,
          sk: "LOOKUP",
          userId: input.userId,
        },
      }),
    ),
  ]);
  return getUser(input.userId);
}

export async function addProperty(input: {
  userId: string;
  address: string;
  hasGas: boolean;
  isHmo: boolean;
}) {
  const user = await getUser(input.userId);
  if (!user) return null;
  const existing = await listPortfolio(input.userId);
  if (existing.length >= propertyLimitForUser(user)) return null;
  const property: LetDueProperty = {
    id: crypto.randomUUID(),
    userId: input.userId,
    address: input.address,
    hasGas: input.hasGas,
    isHmo: input.isHmo,
    createdAt: new Date().toISOString(),
  };
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        pk: `USER#${input.userId}`,
        sk: `PROPERTY#${property.id}`,
        ...property,
      },
    }),
  );
  return property;
}

export async function listAdminCustomers() {
  const users: LetDueUser[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: exclusiveStartKey,
        FilterExpression: "#sk = :profile",
        ExpressionAttributeNames: { "#sk": "sk" },
        ExpressionAttributeValues: { ":profile": "PROFILE" },
      }),
    );
    users.push(...((result.Items ?? []) as LetDueUser[]));
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey && users.length < 5000);

  return users.sort((a, b) => a.email.localeCompare(b.email));
}

export async function setUserPropertyLimit(userId: string, limit: number) {
  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { pk: `USER#${userId}`, sk: "PROFILE" },
      UpdateExpression: "set propertyLimit = :limit",
      ConditionExpression: "attribute_exists(pk)",
      ExpressionAttributeValues: { ":limit": limit },
    }),
  );
}

export async function setUserAdminSuspended(
  userId: string,
  suspended: boolean,
) {
  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { pk: `USER#${userId}`, sk: "PROFILE" },
      UpdateExpression: suspended
        ? "set adminSuspendedAt = :now"
        : "remove adminSuspendedAt",
      ConditionExpression: "attribute_exists(pk)",
      ExpressionAttributeValues: suspended
        ? { ":now": new Date().toISOString() }
        : undefined,
    }),
  );
}

export async function recordSupportRequest(request: LetDueSupportRequest) {
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        pk: "SUPPORT",
        sk: `REQUEST#${request.createdAt}#${request.id}`,
        ...request,
      },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
}

export async function listSupportRequests(limit = 30) {
  const result = await client.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk and begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": "SUPPORT",
        ":prefix": "REQUEST#",
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (result.Items ?? []) as LetDueSupportRequest[];
}

export async function createAdminLoginToken(input: {
  email: string;
  tokenHash: string;
  expiresAtEpoch: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `ADMIN_RATE#${input.email}`,
          sk: "WINDOW",
          expiresAtEpoch: now + 600,
        },
        ConditionExpression:
          "attribute_not_exists(pk) or expiresAtEpoch < :now",
        ExpressionAttributeValues: { ":now": now },
      }),
    );
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return false;
    throw error;
  }

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        pk: `ADMIN_LOGIN#${input.tokenHash}`,
        sk: "TOKEN",
        email: input.email,
        expiresAtEpoch: input.expiresAtEpoch,
      },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
  return true;
}

export async function consumeAdminLoginToken(tokenHash: string) {
  try {
    const result = await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { pk: `ADMIN_LOGIN#${tokenHash}`, sk: "TOKEN" },
        ConditionExpression: "expiresAtEpoch >= :now",
        ExpressionAttributeValues: { ":now": Math.floor(Date.now() / 1000) },
        ReturnValues: "ALL_OLD",
      }),
    );
    return (result.Attributes as { email?: string } | undefined)?.email ?? null;
  } catch (error) {
    if ((error as { name?: string }).name === "ConditionalCheckFailedException")
      return null;
    throw error;
  }
}

export async function createAdminSession(input: {
  email: string;
  tokenHash: string;
  expiresAtEpoch: number;
}) {
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        pk: `ADMIN_SESSION#${input.tokenHash}`,
        sk: "SESSION",
        email: input.email,
        expiresAtEpoch: input.expiresAtEpoch,
      },
      ConditionExpression: "attribute_not_exists(pk)",
    }),
  );
}

export async function getAdminSession(tokenHash: string) {
  const session = await getItem<{ email: string; expiresAtEpoch: number }>(
    `ADMIN_SESSION#${tokenHash}`,
    "SESSION",
  );
  if (!session || session.expiresAtEpoch < Math.floor(Date.now() / 1000))
    return null;
  return session;
}

export async function deleteAdminSession(tokenHash: string) {
  await client.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { pk: `ADMIN_SESSION#${tokenHash}`, sk: "SESSION" },
    }),
  );
}

export async function setSubscriptionStatus(
  customerId: string,
  subscriptionStatus: LetDueUser["subscriptionStatus"],
) {
  const user = await getUserByCustomerId(customerId);
  if (!user) return;
  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { pk: `USER#${user.id}`, sk: "PROFILE" },
      UpdateExpression: "set subscriptionStatus = :status",
      ExpressionAttributeValues: { ":status": subscriptionStatus },
    }),
  );
}

export async function listPortfolio(userId: string) {
  const propertyResult = await client.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk and begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": "PROPERTY#",
      },
    }),
  );
  const properties = (propertyResult.Items ?? []) as LetDueProperty[];
  return Promise.all(
    properties.map(async (property) => {
      const certificateResult = await client.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "pk = :pk and begins_with(sk, :prefix)",
          ExpressionAttributeValues: {
            ":pk": `PROPERTY#${property.id}`,
            ":prefix": "CERT#",
          },
        }),
      );
      return {
        ...property,
        certificates: (certificateResult.Items ?? []) as LetDueCertificate[],
      };
    }),
  );
}

export async function saveCertificate(input: {
  userId: string;
  propertyId: string;
  kind: string;
  expiryDate: string | null;
  documentKey?: string;
}) {
  const id = `${input.propertyId}:${input.kind}`;
  const item: LetDueCertificate & Record<string, unknown> = {
    pk: `PROPERTY#${input.propertyId}`,
    sk: `CERT#${input.kind}`,
    id,
    propertyId: input.propertyId,
    userId: input.userId,
    kind: input.kind,
    expiryDate: input.expiryDate,
    documentKey: input.documentKey,
  };
  if (input.expiryDate) {
    item.gsi1pk = `DUE#${input.expiryDate}`;
    item.gsi1sk = `CERT#${id}`;
  }
  await client.send(new PutCommand({ TableName: tableName, Item: item }));
}

export async function removeCertificate(propertyId: string, kind: string) {
  await client.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { pk: `PROPERTY#${propertyId}`, sk: `CERT#${kind}` },
    }),
  );
}

export async function listCertificatesDue(expiryDate: string) {
  const result = await client.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "LookupIndex",
      KeyConditionExpression: "gsi1pk = :pk",
      ExpressionAttributeValues: { ":pk": `DUE#${expiryDate}` },
    }),
  );
  return (result.Items ?? []) as LetDueCertificate[];
}

export async function listPilotsEnding(endDate: string) {
  const result = await client.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "LookupIndex",
      KeyConditionExpression: "gsi1pk = :pk",
      ExpressionAttributeValues: { ":pk": `PILOT#${endDate}` },
    }),
  );
  return (result.Items ?? []) as LetDueUser[];
}

export async function claimReminder(
  certificateId: string,
  reminderDate: string,
) {
  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `REMINDER#${certificateId}`,
          sk: `DATE#${reminderDate}`,
          sentAt: new Date().toISOString(),
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

export async function releaseReminder(
  certificateId: string,
  reminderDate: string,
) {
  await client.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        pk: `REMINDER#${certificateId}`,
        sk: `DATE#${reminderDate}`,
      },
    }),
  );
}

export async function getProperty(userId: string, propertyId: string) {
  return getItem<LetDueProperty>(`USER#${userId}`, `PROPERTY#${propertyId}`);
}
