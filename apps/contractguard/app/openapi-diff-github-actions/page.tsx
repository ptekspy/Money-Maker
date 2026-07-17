import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/seo-landing-page";

export const metadata: Metadata = {
  title: "OpenAPI Diff for GitHub Pull Requests | API Contract Guard",
  description:
    "Run an OpenAPI diff on every GitHub pull request without maintaining a custom Action. Get pass or fail checks for breaking API contract changes.",
  alternates: { canonical: "/openapi-diff-github-actions" },
};

export default function Page() {
  return (
    <SeoLandingPage
      eyebrow="OpenAPI diff for GitHub"
      title="Turn every OpenAPI diff into"
      accent="a required PR check."
      intro="API contract review belongs beside tests and linting. API Contract Guard installs as a GitHub App and checks changed specifications without a workflow file, runner or script to maintain."
      sections={[
        {
          title: "Install the GitHub App",
          body: "Grant access only to the repositories you choose. There is no long-lived personal access token to create or rotate.",
        },
        {
          title: "Open a pull request",
          body: "When an OpenAPI file changes, the base branch becomes the known contract and the proposed branch becomes the candidate.",
        },
        {
          title: "Require the result",
          body: "Use GitHub branch protection to require the Contract Guard check before a pull request can merge.",
        },
      ]}
      faq={[
        {
          question: "Is this a GitHub Action?",
          answer:
            "No. It is a GitHub App, so repositories do not need a workflow file and teams do not need to manage Action versions or secrets.",
        },
        {
          question: "Can I choose which repositories it reads?",
          answer:
            "Yes. GitHub lets an organisation owner grant the App access to selected repositories only.",
        },
        {
          question: "Can I try the comparison without installing it?",
          answer:
            "Yes. The free browser checker compares two YAML or JSON OpenAPI specifications without a GitHub installation.",
        },
      ]}
    />
  );
}
