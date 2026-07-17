import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "OpenAPI Diff Tool for GitHub Teams | API Contract Guard",
  description:
    "Compare OpenAPI YAML or JSON changes online, then automate the same breaking-change check on every GitHub pull request.",
  alternates: { canonical: "/openapi-diff-tool" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="OpenAPI diff tool"
      title="Compare OpenAPI changes before"
      accent="they reach production."
      intro="API Contract Guard gives teams a free OpenAPI diff tool for quick checks and a GitHub App for enforcing the same compatibility result on every pull request."
      sections={[
        {
          title: "Paste two specifications",
          body: "Compare a baseline OpenAPI document with a proposed JSON or YAML version and see the removed paths, responses, parameters and schemas.",
        },
        {
          title: "Review the breaking changes",
          body: "The report focuses on changes that can break existing API consumers, rather than burying the decision inside a generic text diff.",
        },
        {
          title: "Move the check into GitHub",
          body: "When the manual check becomes part of your release process, install the GitHub App and make the compatibility result a required pull-request status.",
        },
      ]}
      faq={[
        {
          question: "Can I use it without installing anything?",
          answer:
            "Yes. The browser checker can compare OpenAPI YAML or JSON files without a GitHub installation.",
        },
        {
          question: "What does the automated version do?",
          answer:
            "The GitHub App watches pull requests, compares changed OpenAPI files against the base branch and publishes a native GitHub Check.",
        },
        {
          question: "Does API Contract Guard store my OpenAPI files?",
          answer:
            "OpenAPI file contents are fetched for analysis and are not stored as long-term product records.",
        },
      ]}
    />
  );
}
