import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCertificate, getProperty, getUserByToken } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; propertyId: string }> },
) {
  const { token, propertyId } = await params;
  const kind = new URL(request.url).searchParams.get("kind")?.trim();
  if (!kind) return new Response("Document not found", { status: 404 });
  const user = await getUserByToken(token);
  if (!user || !(await getProperty(user.id, propertyId)))
    return new Response("Document not found", { status: 404 });
  const certificate = await getCertificate(propertyId, kind);
  if (!certificate?.documentKey || certificate.userId !== user.id)
    return new Response("Document not found", { status: 404 });

  const object = await new S3Client({}).send(
    new GetObjectCommand({
      Bucket: process.env.LETDUE_DOCUMENTS_BUCKET,
      Key: certificate.documentKey,
    }),
  );
  if (!object.Body) return new Response("Document not found", { status: 404 });
  const fileName = (certificate.originalFileName ?? `${kind}.pdf`).replace(
    /[^a-z0-9_. -]/gi,
    "-",
  );
  return new Response(object.Body.transformToWebStream(), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Content-Type": object.ContentType ?? "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
