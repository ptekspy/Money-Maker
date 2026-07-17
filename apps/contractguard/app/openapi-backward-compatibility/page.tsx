import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "OpenAPI Backward Compatibility Checker | API Contract Guard",
  description:
    "Check OpenAPI backward compatibility online or automatically in GitHub. Find contract changes that can break existing API consumers.",
  alternates: { canonical: "/openapi-backward-compatibility" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="OpenAPI backward compatibility"
      title="Keep API changes"
      accent="safe for existing clients."
      intro="Backward compatibility means a client built against yesterday's contract still works tomorrow. Check that promise before merge instead of discovering the break through support tickets."
      sections={[
        {
          title: "Treat the base as the promise",
          body: "The specification on the base branch represents what current consumers are entitled to depend on.",
        },
        {
          title: "Evaluate the candidate",
          body: "The pull-request version is checked for removed behaviour and stricter requirements that an existing consumer cannot satisfy.",
        },
        {
          title: "Version intentional breaks",
          body: "When a breaking change is necessary, the failed check provides an explicit decision point for versioning or migration planning.",
        },
      ]}
      faq={[
        {
          question: "What makes an API backward compatible?",
          answer:
            "A change is backward compatible when clients that worked with the previous contract can continue to send valid requests and understand valid responses.",
        },
        {
          question: "Is adding an optional field backward compatible?",
          answer:
            "It is usually an additive, compatible change. Making a previously optional request field required is breaking.",
        },
        {
          question: "Can I check compatibility online for free?",
          answer:
            "Yes. Paste or upload the baseline and candidate OpenAPI documents into the free checker on the API Contract Guard homepage.",
        },
      ]}
    />
  );
}
