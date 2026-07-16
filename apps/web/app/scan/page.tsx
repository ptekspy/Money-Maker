import type { Metadata } from "next";
import { RecoveryScanner } from "@/components/recovery-scanner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Free Old Quote Recovery Scan",
  description:
    "Upload a CSV of old quotes and enquiries. See which opportunities are worth chasing and draft follow-ups privately in your browser.",
};

export default function ScanPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <RecoveryScanner />
      </main>
      <SiteFooter />
    </>
  );
}
