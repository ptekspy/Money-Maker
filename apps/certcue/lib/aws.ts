import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

function localDynamoCredentials() {
  return {
    accessKeyId: "FAKE",
    secretAccessKey: "FAKE",
  };
}

function localS3Credentials() {
  return {
    accessKeyId: "letdue-sandbox",
    secretAccessKey: "letdue-sandbox-secret",
  };
}

export function createDynamoClient() {
  const endpoint = process.env.LETDUE_DYNAMO_ENDPOINT;
  return new DynamoDBClient(
    process.env.LETDUE_LOCAL_SANDBOX === "1" && endpoint
      ? {
          endpoint,
          region: "eu-west-2",
          credentials: localDynamoCredentials(),
        }
      : {},
  );
}

export function createS3Client() {
  const endpoint = process.env.LETDUE_S3_ENDPOINT;
  return new S3Client(
    process.env.LETDUE_LOCAL_SANDBOX === "1" && endpoint
      ? {
          endpoint,
          region: "eu-west-2",
          credentials: localS3Credentials(),
          forcePathStyle: true,
        }
      : {},
  );
}
