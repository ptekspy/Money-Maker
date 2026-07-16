import { LegalPage } from "../legal-content";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="TERMS"
      title="Terms of Service"
      intro="These terms describe the current early-access use of API Contract Guard for automated OpenAPI pull-request checks."
      sections={[
        {
          title: "Service",
          body: "API Contract Guard compares OpenAPI specifications in GitHub pull requests and reports compatibility findings through GitHub Checks.",
        },
        {
          title: "Customer responsibility",
          body: "You are responsible for deciding whether to merge a pull request, configuring branch protection, and ensuring your OpenAPI files accurately describe your production API.",
        },
        {
          title: "Billing",
          body: "Trials are offered without a card. Paid protection is billed per private repository once Stripe billing is activated for an installation.",
        },
        {
          title: "Availability",
          body: "The service is provided on a commercially reasonable basis. During early access, features, pricing, and limits may change as the product matures.",
        },
        {
          title: "Support",
          body: "Support is available through support@apicontractguard.com. Include the GitHub organization, repository, and pull-request link when reporting a check issue.",
        },
      ]}
    />
  );
}
