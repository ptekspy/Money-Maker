import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingPage } from "@/components/marketing-page";
import { getLandingPage, landingPages } from "@/lib/landing-data";

export const dynamic = "force-static";
export const dynamicParams = false;

type PageProps = {
  params: Promise<{
    area: string;
    profession: string;
  }>;
};

export function generateStaticParams() {
  return landingPages.map((page) => ({
    area: page.areaSlug,
    profession: page.professionSlug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { area, profession } = await params;
  const page = getLandingPage(area, profession);

  if (!page) {
    return {};
  }

  return {
    title: `${page.area} ${page.profession} Quote Recovery`,
    description: `QuoteWinBack helps ${page.audience} recover old quotes, missed enquiries, and paid leads before they go cold.`,
    alternates: {
      canonical: `/${page.areaSlug}/${page.professionSlug}`,
    },
  };
}

export default async function LocalLandingPage({ params }: PageProps) {
  const { area, profession } = await params;
  const page = getLandingPage(area, profession);

  if (!page) {
    notFound();
  }

  return <MarketingPage landing={page} />;
}
