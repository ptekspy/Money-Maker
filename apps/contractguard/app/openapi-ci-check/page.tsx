import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "OpenAPI CI Check Without Workflow Maintenance | API Contract Guard",
  description:
    "Add an OpenAPI compatibility check to GitHub pull requests without maintaining custom CI scripts, tokens or workflow files.",
  alternates: { canonical: "/openapi-ci-check" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="OpenAPI CI check"
      title="Add API contract protection"
      accent="without another workflow file."
      intro="API Contract Guard acts like CI for OpenAPI compatibility, but runs as a GitHub App. It reports a pass, neutral or breaking result directly on the pull request."
      sections={[
        {
          title: "No runner to configure",
          body: "Install the App on selected repositories instead of wiring a custom Action, storing tokens or maintaining a separate diff script.",
        },
        {
          title: "Native GitHub status",
          body: "The result appears as a GitHub Check, so teams can review it beside tests, linting and deployment previews.",
        },
        {
          title: "Branch protection ready",
          body: "Once the check is trusted, require it in a GitHub ruleset so breaking OpenAPI changes cannot merge unnoticed.",
        },
      ]}
      faq={[
        {
          question: "Is this suitable for small teams?",
          answer:
            "Yes. Starter is designed for small SaaS teams that need OpenAPI protection on a handful of repositories.",
        },
        {
          question: "Can it check YAML and JSON?",
          answer:
            "Yes. API Contract Guard supports OpenAPI 3.x specifications in YAML or JSON.",
        },
        {
          question: "What happens if no OpenAPI file changes?",
          answer:
            "The check reports a neutral result so teams are not blocked by pull requests that do not touch the API contract.",
        },
      ]}
    />
  );
}
