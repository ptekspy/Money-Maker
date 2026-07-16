import { LegalPage } from "../legal-content";

export default function SupportPage() {
  return (
    <LegalPage
      eyebrow="SUPPORT"
      title="Support"
      intro="The fastest way to debug a check is to include the GitHub installation, repository, pull request, and the check output you saw."
      sections={[
        {
          title: "Email",
          body: "Contact support@apicontractguard.com for setup, billing, privacy, or check-result questions.",
        },
        {
          title: "Install help",
          body: "Install the GitHub App, choose repositories, then open a pull request that changes openapi.yaml, openapi.yml, openapi.json, swagger.yaml, swagger.yml, or swagger.json.",
        },
        {
          title: "Demo",
          body: "A live demonstration is available at github.com/ptekspy/contract-guard-live-demo/pull/1/checks showing a removed 200 response being blocked.",
        },
        {
          title: "Status",
          body: "The customer dashboard shows recent checks and recent webhook or worker failures. The health endpoint is available at app.apicontractguard.com/api/system/health.",
        },
      ]}
    />
  );
}
