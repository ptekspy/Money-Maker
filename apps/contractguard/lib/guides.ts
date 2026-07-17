export type Guide = {
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export const guides: Guide[] = [
  {
    slug: "openapi-diff-tool",
    eyebrow: "OPENAPI DIFF TOOL",
    title: "Compare OpenAPI specifications",
    accent: "before you merge",
    description:
      "Compare OpenAPI YAML or JSON files for breaking API changes, then automate the same check on every GitHub pull request.",
    intro:
      "A useful OpenAPI diff does more than list changed lines. It explains whether an endpoint, input, response or schema change can break an existing API consumer.",
    sections: [
      {
        title: "Compare behaviour, not formatting",
        body: "Reordered YAML and rewritten descriptions should not fail a build. Contract Guard parses both specifications and compares the API operations and schemas they describe.",
      },
      {
        title: "Identify consumer-breaking changes",
        body: "Removed endpoints, removed success responses, new required parameters and narrower response schemas are reported as breaking changes with their exact contract location.",
      },
      {
        title: "Start in the browser",
        body: "Paste or upload two OpenAPI 3.x specifications into the free checker. Processing happens in the browser, so the files do not need to be sent to a server.",
      },
      {
        title: "Move the rule into GitHub",
        body: "Install the GitHub App to run the same compatibility check automatically when a pull request changes an OpenAPI JSON or YAML file.",
      },
    ],
    faq: [
      {
        question: "Can I compare YAML with JSON?",
        answer:
          "Yes. Both documents are parsed as OpenAPI structures, so the baseline and candidate can use different supported formats.",
      },
      {
        question: "Does the free OpenAPI diff upload my files?",
        answer: "No. The public checker runs locally in the browser.",
      },
      {
        question: "What is treated as a breaking API change?",
        answer:
          "Examples include removed operations or responses, newly required inputs, removed response properties and incompatible schema type changes.",
      },
      {
        question: "Can the check block a pull request?",
        answer:
          "Yes. The GitHub App publishes a check run that can be made a required branch-protection status.",
      },
    ],
  },
  {
    slug: "swagger-diff-tool",
    eyebrow: "SWAGGER DIFF TOOL",
    title: "Find breaking Swagger changes",
    accent: "without reading raw YAML",
    description:
      "Diff Swagger and OpenAPI contracts for breaking endpoint, parameter, response and schema changes.",
    intro:
      "Line-by-line diffs are noisy when API files are generated or reformatted. A contract-aware comparison focuses on changes that affect callers.",
    sections: [
      {
        title: "Parse the API document",
        body: "Contract Guard reads OpenAPI 3.x JSON and YAML as structured API definitions instead of treating the file as plain text.",
      },
      {
        title: "Classify compatibility",
        body: "The report separates breaking changes from compatible additions and shows the affected HTTP operation or schema location.",
      },
      {
        title: "Give reviewers a clear answer",
        body: "A concise pass or fail result is easier to review than hundreds of generated YAML lines and makes accidental contract breaks harder to miss.",
      },
      {
        title: "Enforce it on pull requests",
        body: "The GitHub check runs as part of the normal pull-request workflow, without requiring developers to remember a separate command.",
      },
    ],
    faq: [
      {
        question: "Is Swagger the same as OpenAPI?",
        answer:
          "Swagger is commonly used to refer to OpenAPI descriptions. The public checker currently requires an OpenAPI 3.x document.",
      },
      {
        question: "Will description changes fail the check?",
        answer:
          "No. Documentation-only edits are not consumer-breaking contract changes.",
      },
      {
        question: "Can generated specifications be checked?",
        answer:
          "Yes. Commit the generated specification or generate it before the pull-request check can read it.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes. Starter protects up to 3 repositories for 14 days without requiring a card.",
      },
    ],
  },
  {
    slug: "openapi-github-app",
    eyebrow: "OPENAPI GITHUB APP",
    title: "Put API compatibility",
    accent: "inside every pull request",
    description:
      "Install an OpenAPI GitHub App that detects breaking API contract changes and reports them as pull-request checks.",
    intro:
      "API compatibility works best when it is part of the merge path. Contract Guard installs at repository level and reports directly where developers already review changes.",
    sections: [
      {
        title: "Install for selected repositories",
        body: "A GitHub organisation owner can grant access to all repositories or only the repositories that contain API contracts.",
      },
      {
        title: "Detect changed specifications",
        body: "Pull-request events trigger a comparison when supported OpenAPI JSON or YAML files change between the base and head branches.",
      },
      {
        title: "Publish a GitHub check",
        body: "The result includes the number of breaking changes and concrete details for affected paths, responses, parameters and schemas.",
      },
      {
        title: "Use branch protection",
        body: "Make the check required in GitHub rulesets so a breaking contract cannot merge until it is fixed or intentionally redesigned.",
      },
    ],
    faq: [
      {
        question: "Does every repository need configuration?",
        answer:
          "The App automatically looks for supported OpenAPI files. Repository access is controlled through the normal GitHub App installation settings.",
      },
      {
        question: "Can I install it on private repositories?",
        answer:
          "Yes, when the GitHub App is granted access to those repositories.",
      },
      {
        question: "Does it comment on pull requests?",
        answer:
          "It publishes a GitHub check run, giving reviewers a native pass or fail status and compatibility summary.",
      },
      {
        question: "How many repositories are included?",
        answer:
          "Starter includes 3, Pro includes 20, and Teams includes 50 repositories.",
      },
    ],
  },
  {
    slug: "api-breaking-change-examples",
    eyebrow: "BREAKING CHANGE EXAMPLES",
    title: "Recognise API changes",
    accent: "that break real consumers",
    description:
      "Practical examples of breaking REST API and OpenAPI changes, including removed responses, required parameters and schema changes.",
    intro:
      "A change can look small in code while forcing every consumer to update. These are the contract edits that deserve an automated compatibility gate.",
    sections: [
      {
        title: "Removing an endpoint or response",
        body: "Deleting an operation or a response status that clients handle removes behaviour they may already depend on and is normally breaking.",
      },
      {
        title: "Making an input required",
        body: "Adding a required query parameter, header or request property breaks clients that continue sending requests in the old shape.",
      },
      {
        title: "Narrowing a response schema",
        body: "Removing a response property, changing its type or restricting an enum can break deserialisation and downstream business logic.",
      },
      {
        title: "Separating compatible additions",
        body: "New optional inputs, additional endpoints and additive response capabilities can usually ship without forcing existing consumers to change.",
      },
    ],
    faq: [
      {
        question: "Is adding a new endpoint breaking?",
        answer:
          "No. A new independent endpoint does not remove behaviour used by existing clients.",
      },
      {
        question: "Is adding an optional property breaking?",
        answer:
          "It is commonly compatible, although strict consumers should still be designed to tolerate additive response fields.",
      },
      {
        question: "Is changing an enum breaking?",
        answer:
          "Removing an allowed value is breaking. Adding a response enum value may also affect clients that assume the set is exhaustive.",
      },
      {
        question: "How can teams catch these changes?",
        answer:
          "Compare the base and proposed OpenAPI documents automatically on every pull request and require the compatibility check before merge.",
      },
    ],
  },
  {
    slug: "openapi-schema-compatibility-checker",
    eyebrow: "SCHEMA COMPATIBILITY",
    title: "Check OpenAPI schemas",
    accent: "for backward compatibility",
    description:
      "Check OpenAPI request and response schemas for backward-incompatible type, property and requirement changes.",
    intro:
      "Endpoint paths are only part of an API contract. Schema changes inside requests and responses are often where subtle consumer breaks occur.",
    sections: [
      {
        title: "Track response properties",
        body: "Removing a documented response property can break typed clients, mappings and UI code even when the endpoint and status code still exist.",
      },
      {
        title: "Compare primitive types",
        body: "Changing a string to a number, an object to an array or another incompatible type changes the value a consumer must parse.",
      },
      {
        title: "Detect new requirements",
        body: "A formerly optional request field becoming required means existing callers can begin receiving validation failures.",
      },
      {
        title: "Report the exact location",
        body: "Contract Guard identifies the affected operation or schema path so a developer can understand and resolve the compatibility problem quickly.",
      },
    ],
    faq: [
      {
        question: "Does it resolve schema references?",
        answer:
          "The comparison engine follows supported local OpenAPI schema structures while analysing operation inputs and responses.",
      },
      {
        question: "Are request and response rules the same?",
        answer:
          "No. Compatibility direction matters: making an input stricter and making an output narrower are common breaking patterns.",
      },
      {
        question: "Can I check a schema before installing?",
        answer:
          "Yes. Paste or upload the baseline and candidate specifications into the free browser checker.",
      },
      {
        question: "Can teams share the results?",
        answer:
          "Yes. Teams workspaces provide shared installations, checks, roles and central billing.",
      },
    ],
  },
  {
    slug: "openapi-ci-check",
    eyebrow: "OPENAPI CI CHECK",
    title: "Add an OpenAPI compatibility gate",
    accent: "to CI",
    description:
      "Add automatic OpenAPI backward-compatibility checks to GitHub pull requests without maintaining a custom CI script.",
    intro:
      "A compatibility gate turns an API-design guideline into an enforceable merge rule. The most reliable check runs automatically and produces a result reviewers can understand.",
    sections: [
      {
        title: "Trigger from pull requests",
        body: "The GitHub App receives pull-request events and queues a contract comparison when a supported API specification changes.",
      },
      {
        title: "Compare base with head",
        body: "The proposed specification is compared with the pull request's base branch, matching the exact compatibility decision required before merge.",
      },
      {
        title: "Return a native status",
        body: "The result appears in GitHub Checks with a clear conclusion and a summary of each detected contract change.",
      },
      {
        title: "Require the result",
        body: "Add API Contract Guard to a repository ruleset or branch-protection rule to prevent accidental breaking changes from merging.",
      },
    ],
    faq: [
      {
        question: "Do I need to edit a workflow file?",
        answer:
          "No. The GitHub App runs from installation and pull-request events, so there is no action YAML to copy into every repository.",
      },
      {
        question: "What happens when no OpenAPI file changes?",
        answer:
          "The App only needs to perform compatibility work for relevant contract changes.",
      },
      {
        question: "Can it be a required check?",
        answer:
          "Yes. GitHub rulesets and branch protection can require the check before merging.",
      },
      {
        question: "Does it work across an organisation?",
        answer:
          "Yes. Pro and Teams plans cover multiple repositories, and Teams supports shared workspace access and multiple installations.",
      },
    ],
  },
];

export function guideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
