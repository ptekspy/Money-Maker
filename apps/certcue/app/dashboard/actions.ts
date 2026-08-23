"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createS3Client } from "@/lib/aws";
import {
  addProperty,
  getInboxItem,
  getProperty,
  getUserByToken,
  hasActiveAccess,
  markInboxItemFiled,
  propertyLimitForUser,
  saveCertificate,
  saveInboxItem,
  setUserPropertyLimit,
} from "@/lib/data";
import { extractCertificateDetails } from "@/lib/extract-certificate";
import { extractPdfText } from "@/lib/pdf-text";
import { annualPricePenceForLimit } from "@/lib/pricing";
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
  if (!user || !hasActiveAccess(user)) return;
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

export async function upgradePortfolio(formData: FormData) {
  const token = z.uuid().safeParse(formData.get("token"));
  const target = z.coerce
    .number()
    .int()
    .min(4)
    .max(249)
    .safeParse(formData.get("propertyLimit"));
  const prorationDate = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(formData.get("prorationDate"));
  const nowEpoch = Math.floor(Date.now() / 1000);
  if (
    !token.success ||
    !target.success ||
    !prorationDate.success ||
    Math.abs(nowEpoch - prorationDate.data) > 1_800 ||
    !process.env.STRIPE_SECRET_KEY
  ) {
    return;
  }

  const user = await getUserByToken(token.data);
  if (
    !user?.stripeCustomerId ||
    user.plan !== "paid" ||
    !hasActiveAccess(user) ||
    target.data <= propertyLimitForUser(user)
  ) {
    redirect(`/dashboard/${token.data}?upgrade=invalid#portfolio-plans`);
  }

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "active",
    limit: 10,
  });
  const subscription = subscriptions.data.find(
    (candidate) => candidate.items.data.length === 1,
  );
  const item = subscription?.items.data[0];
  if (!subscription || !item) {
    redirect(`/dashboard/${token.data}?upgrade=unavailable#portfolio-plans`);
  }

  const product =
    typeof item.price.product === "string"
      ? item.price.product
      : item.price.product.id;
  const updated = await stripe.subscriptions.update(
    subscription.id,
    {
      items: [
        {
          id: item.id,
          price_data: {
            currency: "gbp",
            product,
            unit_amount: annualPricePenceForLimit(target.data),
            recurring: { interval: "year" },
          },
        },
      ],
      payment_behavior: "pending_if_incomplete",
      proration_behavior: "always_invoice",
      proration_date: prorationDate.data,
      expand: ["latest_invoice"],
    },
    {
      idempotencyKey: `letdue-upgrade-${user.id}-${target.data}-${prorationDate.data}`,
    },
  );

  if (updated.pending_update) {
    const invoice =
      updated.latest_invoice && typeof updated.latest_invoice !== "string"
        ? updated.latest_invoice
        : null;
    if (invoice?.hosted_invoice_url) redirect(invoice.hosted_invoice_url);
    redirect(`/dashboard/${token.data}?upgrade=payment#portfolio-plans`);
  }

  await setUserPropertyLimit(user.id, target.data);
  redirect(`/dashboard/${token.data}?upgrade=success#portfolio-plans`);
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
  if (!user || !hasActiveAccess(user)) return;
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
  const files = [
    ...formData.getAll("certificates"),
    ...formData.getAll("certificate"),
  ].filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!token.success || !propertyId.success || files.length === 0) return;
  const user = await getUserByToken(token.data);
  if (
    !user ||
    !hasActiveAccess(user) ||
    !(await getProperty(user.id, propertyId.data))
  )
    return;
  if (
    files.length > 20 ||
    files.reduce((total, file) => total + file.size, 0) > 10_000_000 ||
    files.some(
      (file) =>
        file.size > 10_000_000 ||
        (file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")),
    )
  ) {
    redirect(`/dashboard/${token.data}?upload=invalid`);
  }

  const s3 = createS3Client();
  let filed = 0;
  let review = 0;

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const documentBytes = bytes.slice();
    const details = extractCertificateDetails(await extractPdfText(bytes));

    const uploadedAt = new Date().toISOString();
    const itemId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
    const documentKey = `users/${user.id}/properties/${propertyId.data}/${uploadedAt.slice(0, 10)}/${itemId}-${safeName}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.LETDUE_DOCUMENTS_BUCKET,
        Key: documentKey,
        Body: documentBytes,
        ContentType: "application/pdf",
        ...(process.env.LETDUE_LOCAL_SANDBOX === "1"
          ? {}
          : { ServerSideEncryption: "AES256" as const }),
        Metadata: { certificateKind: details.kind ?? "unclassified" },
      }),
    );

    const canFile =
      details.kind !== null &&
      details.expiry !== null &&
      details.confidence === "high";
    await saveInboxItem({
      id: itemId,
      propertyId: propertyId.data,
      userId: user.id,
      fileName: file.name,
      documentKey,
      kind: details.kind,
      expiryDate: details.expiry,
      candidates: [...details.candidates],
      confidence: details.confidence,
      status: canFile ? "filed" : "needs_review",
      uploadedAt,
      filedAt: canFile ? uploadedAt : undefined,
    });

    if (canFile) {
      await saveCertificate({
        userId: user.id,
        propertyId: propertyId.data,
        kind: details.kind as string,
        expiryDate: details.expiry,
        documentKey,
        originalFileName: file.name,
        uploadedAt,
        extractionConfidence: details.confidence,
        auditType: "document_uploaded",
      });
      filed += 1;
    } else {
      review += 1;
    }
  }
  redirect(
    `/dashboard/${token.data}?upload=${review > 0 ? "review" : "success"}&filed=${filed}&review=${review}`,
  );
}

export async function confirmInboxItem(formData: FormData) {
  const parsed = z
    .object({
      token: z.uuid(),
      propertyId: z.uuid(),
      itemId: z.uuid(),
      uploadedAt: z.iso.datetime(),
      kind: certificateSchema.shape.kind,
      expiryDate: z.iso.date(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const user = await getUserByToken(parsed.data.token);
  if (!user || !hasActiveAccess(user)) return;
  const property = await getProperty(user.id, parsed.data.propertyId);
  const item = await getInboxItem(
    parsed.data.propertyId,
    parsed.data.itemId,
    parsed.data.uploadedAt,
  );
  if (
    !property ||
    !item ||
    item.userId !== user.id ||
    item.status !== "needs_review"
  )
    return;

  await saveCertificate({
    userId: user.id,
    propertyId: property.id,
    kind: parsed.data.kind,
    expiryDate: parsed.data.expiryDate,
    documentKey: item.documentKey,
    originalFileName: item.fileName,
    uploadedAt: item.uploadedAt,
    extractionConfidence: item.confidence,
    auditType: "document_reviewed",
  });
  await markInboxItemFiled(property.id, item);
  redirect(`/dashboard/${parsed.data.token}?upload=confirmed`);
}
