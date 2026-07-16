export async function GET() {
  return Response.json({ ready: true, storage: "aws" });
}
