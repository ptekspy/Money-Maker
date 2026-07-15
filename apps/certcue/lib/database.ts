import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!sqlClient) {
    const databaseUrl = process.env.CERTCUE_DATABASE_URL;
    if (!databaseUrl)
      throw new Error("CERTCUE_DATABASE_URL is not configured.");
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}
