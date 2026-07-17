import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "Stop Breaking API Changes Before Merge | API Contract Guard",
  description:
    "Catch breaking API changes in OpenAPI pull requests before they reach production or surprise downstream customers.",
  alternates: { canonical: "/stop-breaking-api-changes" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="Breaking API changes"
      title="Stop breaking API changes"
      accent="at pull request time."
      intro="When an API contract lives in GitHub, the safest time to catch a breaking change is before merge. API Contract Guard compares the proposed OpenAPI contract and flags compatibility risks early."
      sections={[
        {
          title: "Catch consumer-visible breaks",
          body: "Removed endpoints, removed response codes, newly required fields and incompatible schema changes are highlighted before release.",
        },
        {
          title: "Keep review close to code",
          body: "Developers see the compatibility result on the same pull request as the implementation change, not days later in a release checklist.",
        },
        {
          title: "Give API owners a clear gate",
          body: "Use the GitHub Check as a lightweight contract gate for teams that want fewer accidental API regressions.",
        },
      ]}
      faq={[
        {
          question: "What counts as a breaking API change?",
          answer:
            "Examples include removing a path, removing a response status, making a parameter required or changing a schema in a way existing consumers cannot safely accept.",
        },
        {
          question: "Does it replace human API review?",
          answer:
            "No. It gives reviewers a focused compatibility report so they can spend time on design decisions instead of manually scanning OpenAPI diffs.",
        },
        {
          question: "Can I start without changing branch protection?",
          answer:
            "Yes. Install it first, watch the results on pull requests, then require the check once your team is comfortable with it.",
        },
      ]}
    />
  );
}
