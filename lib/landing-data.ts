export type ProfessionLanding = {
  area: string;
  areaSlug: string;
  profession: string;
  professionSlug: string;
  audience: string;
  enquirySources: string[];
  exampleRows: [string, "Hot" | "Warm" | "Review"][];
  pipelineValue: string;
  averageJob: string;
  proofPoints: string[];
};

export const genericSources = [
  "Missed calls",
  "Old quotes",
  "Website forms",
  "Checkatrade",
  "MyBuilder",
  "Bark",
  "Facebook",
];

export const landingPages: ProfessionLanding[] = [
  {
    area: "Bradford",
    areaSlug: "bradford",
    profession: "Roofers",
    professionSlug: "roofers",
    audience: "Bradford roofers",
    enquirySources: [
      "Roof repairs",
      "Flat roofing",
      "Guttering",
      "Storm damage",
      "Checkatrade",
      "MyBuilder",
      "Facebook",
    ],
    exampleRows: [
      ["Roof leak quote", "Hot"],
      ["Flat roof repair", "Warm"],
      ["Gutter enquiry", "Review"],
    ],
    pipelineValue: "GBP 18,650",
    averageJob: "roof repairs and replacements",
    proofPoints: [
      "Old roof repair quotes that never received a second touch",
      "Paid marketplace leads that were opened once and forgotten",
      "Website forms where the customer still has a live problem",
    ],
  },
  {
    area: "Leeds",
    areaSlug: "leeds",
    profession: "Plumbers",
    professionSlug: "plumbers",
    audience: "Leeds plumbers",
    enquirySources: [
      "Leak repairs",
      "Bathroom quotes",
      "Boiler issues",
      "Emergency callouts",
      "Google",
      "Bark",
      "Website forms",
    ],
    exampleRows: [
      ["Bathroom quote", "Hot"],
      ["Leak repair enquiry", "Warm"],
      ["Boiler callback", "Review"],
    ],
    pipelineValue: "GBP 12,400",
    averageJob: "urgent repairs and bathroom work",
    proofPoints: [
      "Quote requests where the customer never clearly said no",
      "Emergency enquiries that went unanswered during busy periods",
      "Bathroom and repair jobs that are still worth a polite follow-up",
    ],
  },
  {
    area: "Halifax",
    areaSlug: "halifax",
    profession: "Damp Proofing",
    professionSlug: "damp-proofing",
    audience: "Halifax damp proofing firms",
    enquirySources: [
      "Damp surveys",
      "Mould enquiries",
      "Basement damp",
      "Wall treatment",
      "Google",
      "Rated People",
      "Website forms",
    ],
    exampleRows: [
      ["Damp survey quote", "Hot"],
      ["Mould treatment", "Warm"],
      ["Basement enquiry", "Review"],
    ],
    pipelineValue: "GBP 15,900",
    averageJob: "surveys, treatments, and remedial work",
    proofPoints: [
      "Survey enquiries that were priced but not followed up",
      "Homeowners with visible damp problems who may still need help",
      "Old form fills and quote requests with useful context attached",
    ],
  },
];

export function getLandingPage(area: string, profession: string) {
  return landingPages.find(
    (page) => page.areaSlug === area && page.professionSlug === profession,
  );
}

export function mailtoHref(subject = "QuoteWinBack recovery scan request") {
  const body = [
    "Hi QuoteWinBack,",
    "",
    "I'd like a recovery scan for old quotes and missed enquiries.",
    "",
    "Company name:",
    "Trade:",
    "Location:",
    "Where our enquiries come from:",
    "",
    "Thanks,",
  ].join("\n");

  return `mailto:hello@quotewinback.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function deleteDataHref() {
  const body = [
    "Hi QuoteWinBack,",
    "",
    "Please delete the data/files you hold for the following business or recovery scan.",
    "",
    "Company name:",
    "Contact name:",
    "Email address used:",
    "Approximate date files were sent:",
    "Anything else that will help identify the data:",
    "",
    "Please confirm when deletion has been completed.",
    "",
    "Thanks,",
  ].join("\n");

  return `mailto:hello@quotewinback.co.uk?subject=${encodeURIComponent("Delete data request")}&body=${encodeURIComponent(body)}`;
}
