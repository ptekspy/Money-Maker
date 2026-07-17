import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "API Contract Testing for OpenAPI Teams | API Contract Guard",
  description:
    "Add API contract testing to your pull-request workflow. Validate OpenAPI compatibility before implementation changes reach production.",
  alternates: { canonical: "/api-contract-testing" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="API contract testing"
      title="Test the promise your API makes"
      accent="to every client."
      intro="Unit tests prove code behaves as expected. API contract tests protect the interface other teams and customers rely on, even when the implementation behind it changes."
      sections={[
        {
          title: "Keep a versioned contract",
          body: "Store the OpenAPI specification with the service so the reviewed contract changes in the same pull request as the implementation.",
        },
        {
          title: "Compare compatibility",
          body: "Check the proposed contract against the base branch and distinguish safe additions from changes that can break existing clients.",
        },
        {
          title: "Make failure actionable",
          body: "Show the affected path, operation and reason inside the GitHub check so the author can fix or deliberately version the API.",
        },
      ]}
      faq={[
        {
          question: "How is contract testing different from unit testing?",
          answer:
            "Unit tests validate implementation behaviour. Contract testing validates that the public interface remains compatible for its consumers.",
        },
        {
          question: "Do I need to run the API to compare specifications?",
          answer:
            "No. API Contract Guard performs a static comparison of the base and candidate OpenAPI documents.",
        },
        {
          question: "Does a new endpoint count as breaking?",
          answer:
            "Normally no. Additive changes are reported as safe while removals and incompatible requirements fail the check.",
        },
      ]}
    />
  );
}
