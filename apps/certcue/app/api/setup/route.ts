import { getSql } from "@/lib/database";
import { schemaSql } from "@/lib/schema";

export async function POST(request: Request) {
  if (
    !process.env.SETUP_SECRET ||
    request.headers.get("authorization") !==
      `Bearer ${process.env.SETUP_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await getSql().query(schemaSql);
  return Response.json({ ready: true });
}
