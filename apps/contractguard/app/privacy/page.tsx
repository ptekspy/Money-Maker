import { LegalPage } from "../legal-content";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="PRIVACY"
      title="Privacy Policy"
      intro="API Contract Guard only requests the GitHub access needed to inspect repositories you install it on and create pull-request checks."
      sections={[
        {
          title: "Data we process",
          body: "We process GitHub account identifiers, installation identifiers, repository names, pull-request numbers, commit SHAs, and OpenAPI files needed to compare a pull request against its base branch.",
        },
        {
          title: "What we store",
          body: "We store installation metadata, recent check summaries, billing status, and operational events. OpenAPI file contents are fetched for analysis and are not stored as long-term product records.",
        },
        {
          title: "Third parties",
          body: "GitHub provides installation, repository, pull-request and check-run APIs. Stripe handles paid subscription checkout and billing. If a visitor accepts optional analytics, Google Analytics measures page views and acquisition channels; analytics does not load when consent is declined.",
        },
        {
          title: "Security",
          body: "Webhook signatures are verified, GitHub App private keys are stored as deployment secrets, and production data is stored in AWS infrastructure controlled by the service operator.",
        },
        {
          title: "Contact",
          body: "For privacy, support, or deletion requests, contact support@apicontractguard.com and include the GitHub organization or username connected to the installation.",
        },
      ]}
    />
  );
}
