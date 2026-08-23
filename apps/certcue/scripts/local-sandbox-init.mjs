import {
  CreateTableCommand,
  DynamoDBClient,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

const s3Credentials = {
  accessKeyId: "letdue-sandbox",
  secretAccessKey: "letdue-sandbox-secret",
};
const dynamo = new DynamoDBClient({
  endpoint: "http://127.0.0.1:4567",
  region: "eu-west-2",
  credentials: { accessKeyId: "FAKE", secretAccessKey: "FAKE" },
});
const s3 = new S3Client({
  endpoint: "http://127.0.0.1:4568",
  region: "eu-west-2",
  credentials: s3Credentials,
  forcePathStyle: true,
});

try {
  await dynamo.send(
    new CreateTableCommand({
      TableName: "letdue-sandbox",
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
        { AttributeName: "gsi1pk", AttributeType: "S" },
        { AttributeName: "gsi1sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "LookupIndex",
          KeySchema: [
            { AttributeName: "gsi1pk", KeyType: "HASH" },
            { AttributeName: "gsi1sk", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    }),
  );
} catch (error) {
  if (error?.name !== "ResourceInUseException") throw error;
}
await waitUntilTableExists(
  { client: dynamo, maxWaitTime: 30, minDelay: 1, maxDelay: 2 },
  { TableName: "letdue-sandbox" },
);
try {
  await s3.send(
    new CreateBucketCommand({ Bucket: "letdue-sandbox-documents" }),
  );
} catch (error) {
  if (error?.name !== "BucketAlreadyOwnedByYou") throw error;
}
console.log("LETDUE_SANDBOX_INITIALIZED");
