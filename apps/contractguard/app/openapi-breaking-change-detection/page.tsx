import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "OpenAPI Breaking Change Detection | API Contract Guard",
  description:
    "Detect breaking OpenAPI changes before merge. Check removed endpoints, responses, required parameters and incompatible schema changes in every pull request.",
  alternates: { canonical: "/openapi-breaking-change-detection" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="OpenAPI breaking change detection"
      title="Find breaking OpenAPI changes"
      accent="before your users do."
      intro="A small contract edit can break every client that depends on your API. Compare the proposed specification with the current one and turn risky changes into a visible pull-request check."
      sections={[
        {
          title: "Removed operations and responses",
          body: "Catch deleted paths, HTTP methods and success responses that existing integrations may still call or expect.",
        },
        {
          title: "New required inputs",
          body: "Flag parameters or request properties that become mandatory, because existing clients cannot provide fields they were never built to send.",
        },
        {
          title: "Incompatible schema edits",
          body: "Surface response properties, types and constraints that no longer match the contract your consumers integrated against.",
        },
      ]}
      faq={[
        {
          question: "What is a breaking OpenAPI change?",
          answer:
            "It is a contract change that can cause a previously valid API client to fail, such as removing an endpoint, removing a response or adding a required input.",
        },
        {
          question: "Does it support YAML and JSON?",
          answer:
            "Yes. API Contract Guard compares OpenAPI specifications written in either YAML or JSON.",
        },
        {
          question: "Can it block a GitHub pull request?",
          answer:
            "Yes. The GitHub App reports a failed check when it detects a breaking contract change, so branch protection can prevent the merge.",
        },
      ]}
    />
  );
}
