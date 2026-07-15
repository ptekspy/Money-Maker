"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { PDFParse } from "pdf-parse";
import { z } from "zod";
import {
  addProperty,
  getProperty,
  getUserByToken,
  saveCertificate,
} from "@/lib/data";
import { extractCertificateDetails } from "@/lib/extract-certificate";
import { getStripe } from "@/lib/stripe";

const certificateSchema = z.object({
  token: z.uuid(),
  propertyId: z.uuid(),
  kind: z.enum([
    "Gas safety",
    "EICR",
    "EPC",
    "Landlord insurance",
    "Property licence",
  ]),
  expiryDate: z.iso.date(),
});

export async function updateCertificate(formData: FormData) {
  const parsed = certificateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const user = await getUserByToken(parsed.data.token);
  if (!user) return;
  const property = await getProperty(user.id, parsed.data.propertyId);
  if (!property) return;
  await saveCertificate({
    userId: user.id,
    propertyId: property.id,
    kind: parsed.data.kind,
    expiryDate: parsed.data.expiryDate,
  });
  redirect(`/dashboard/${parsed.data.token}?saved=1`);
}

export async function openBillingPortal(formData: FormData) {
  const token = z.uuid().safeParse(formData.get("token"));
  if (!token.success || !process.env.STRIPE_SECRET_KEY) return;
  const user = await getUserByToken(token.data);
  if (!user?.stripeCustomerId) return;
  const appUrl = process.env.NEXT_PUBLIC_CERTCUE_URL ?? "https://letdue.com";
  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/${token.data}`,
  });
  redirect(session.url);
}

export async function addPortfolioProperty(formData: FormData) {
  const token = z.uuid().safeParse(formData.get("token"));
  const address = z
    .string()
    .trim()
    .min(5)
    .max(200)
    .safeParse(formData.get("address"));
  if (!token.success || !address.success) return;
  const user = await getUserByToken(token.data);
  if (user?.subscriptionStatus !== "active") return;
  const property = await addProperty({
    userId: user.id,
    address: address.data,
    hasGas: formData.get("hasGas") === "on",
    isHmo: formData.get("isHmo") === "on",
  });
  redirect(`/dashboard/${token.data}?property=${property ? "added" : "limit"}`);
}

export async function uploadCertificate(formData: FormData) {
  const token = z.uuid().safeParse(formData.get("token"));
  const propertyId = z.uuid().safeParse(formData.get("propertyId"));
  const file = formData.get("certificate");
  if (!token.success || !propertyId.success || !(file instanceof File)) return;
  const user = await getUserByToken(token.data);
  if (!user || !(await getProperty(user.id, propertyId.data))) return;
  if (
    file.size > 10_000_000 ||
    (file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf"))
  ) {
    redirect(`/dashboard/${token.data}?upload=invalid`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const parser = new PDFParse({ data: bytes });
  let details: ReturnType<typeof extractCertificateDetails>;
  try {
    const result = await parser.getText();
    details = extractCertificateDetails(result.text);
  } finally {
    await parser.destroy();
  }
  if (!details.kind || !details.expiry) {
    redirect(`/dashboard/${token.data}?upload=review`);
  }

  const safeName = file.name.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
  const documentKey = `users/${user.id}/properties/${propertyId.data}/${Date.now()}-${safeName}`;
  await new S3Client({}).send(
    new PutObjectCommand({
      Bucket: process.env.LETDUE_DOCUMENTS_BUCKET,
      Key: documentKey,
      Body: bytes,
      ContentType: "application/pdf",
      ServerSideEncryption: "AES256",
      Metadata: { certificateKind: details.kind },
    }),
  );
  await saveCertificate({
    userId: user.id,
    propertyId: propertyId.data,
    kind: details.kind,
    expiryDate: details.expiry,
    documentKey,
  });
  redirect(`/dashboard/${token.data}?upload=success`);
}
