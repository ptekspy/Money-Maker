"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addProperty,
  getProperty,
  getUserByToken,
  hasActiveAccess,
  propertyLimitForUser,
  saveCertificate,
  setUserPropertyLimit,
} from "@/lib/data";
import { extractCertificateDetails } from "@/lib/extract-certificate";
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
  const file = formData.get("certificate");
  if (!token.success || !propertyId.success || !(file instanceof File)) return;
  const user = await getUserByToken(token.data);
  if (
    !user ||
    !hasActiveAccess(user) ||
    !(await getProperty(user.id, propertyId.data))
  )
    return;
  if (
    file.size > 10_000_000 ||
    (file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf"))
  ) {
    redirect(`/dashboard/${token.data}?upload=invalid`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { PDFParse } = await import("pdf-parse");
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
