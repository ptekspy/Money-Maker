import assert from "node:assert/strict";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

if (process.env.LETDUE_LOCAL_SANDBOX !== "1") {
  throw new Error("Refusing to inspect data without LETDUE_LOCAL_SANDBOX=1.");
}

const email = process.argv[2]?.trim().toLowerCase();
const expectedLimit = Number(process.argv[3]);
assert.ok(email);
assert.ok(Number.isInteger(expectedLimit));

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    endpoint: process.env.LETDUE_DYNAMO_ENDPOINT,
    region: "eu-west-2",
    credentials: { accessKeyId: "FAKE", secretAccessKey: "FAKE" },
  }),
);
const s3 = new S3Client({
  endpoint: process.env.LETDUE_S3_ENDPOINT,
  region: "eu-west-2",
  credentials: {
    accessKeyId: "letdue-sandbox",
    secretAccessKey: "letdue-sandbox-secret",
  },
  forcePathStyle: true,
});

const items = [];
let exclusiveStartKey;
do {
  const page = await dynamo.send(
    new ScanCommand({
      TableName: process.env.LETDUE_TABLE_NAME,
      ExclusiveStartKey: exclusiveStartKey,
    }),
  );
  items.push(...(page.Items ?? []));
  exclusiveStartKey = page.LastEvaluatedKey;
} while (exclusiveStartKey);

const profile = items.find(
  (item) => item.sk === "PROFILE" && item.email?.toLowerCase() === email,
);
assert.ok(profile, "Sandbox user profile was not found.");
assert.equal(profile.subscriptionStatus, "active");
assert.equal(profile.propertyLimit, expectedLimit);

const properties = items.filter(
  (item) =>
    item.pk === `USER#${profile.id}` &&
    typeof item.sk === "string" &&
    item.sk.startsWith("PROPERTY#"),
);
const propertyIds = new Set(properties.map((item) => item.id));
const propertyRecords = items.filter((item) =>
  propertyIds.has(String(item.pk).replace(/^PROPERTY#/, "")),
);
const certificates = propertyRecords.filter((item) =>
  String(item.sk).startsWith("CERT#"),
);
const inbox = propertyRecords.filter((item) =>
  String(item.sk).startsWith("INBOX#"),
);
const audit = propertyRecords.filter((item) =>
  String(item.sk).startsWith("AUDIT#"),
);
const objects = await s3.send(
  new ListObjectsV2Command({ Bucket: process.env.LETDUE_DOCUMENTS_BUCKET }),
);

assert.equal(properties.length, 4);
assert.equal(certificates.length, 2);
assert.equal(inbox.filter((item) => item.status === "filed").length, 2);
assert.equal(inbox.filter((item) => item.status === "needs_review").length, 1);
assert.ok(audit.length >= 3);
assert.equal(objects.KeyCount, 3);

process.stdout.write(
  `${JSON.stringify({
    subscriptionStatus: profile.subscriptionStatus,
    propertyLimit: profile.propertyLimit,
    properties: properties.length,
    certificates: certificates.length,
    inbox: {
      filed: inbox.filter((item) => item.status === "filed").length,
      needsReview: inbox.filter((item) => item.status === "needs_review")
        .length,
    },
    auditEvents: audit.length,
    storedPdfObjects: objects.KeyCount,
  })}\n`,
);
