const sampleLeads = [
  {
    name: "Sarah Jenkins",
    phone: "07700 900144",
    email: "sarah@example.com",
    service: "Roof leak inspection",
    status: "Quote sent",
    source: "Website form",
    date: "2026-06-19",
    value: "1800",
    notes: "Asked about a leak near the upstairs bedroom after heavy rain. Quote sent, no reply after first follow-up."
  },
  {
    name: "Mike Alvarez",
    phone: "07700 900129",
    email: "mike@example.com",
    service: "Gutter and flashing repair",
    status: "Missed call",
    source: "Google Business Profile",
    date: "2026-07-04",
    value: "650",
    notes: "Called twice after heavy rain. No voicemail left."
  },
  {
    name: "Priya Shah",
    phone: "07700 900168",
    email: "priya@example.com",
    service: "Full re-roof quote",
    status: "Estimate requested",
    source: "Checkatrade",
    date: "2026-05-28",
    value: "8500",
    notes: "Wanted a quote before deciding between repair and full replacement."
  },
  {
    name: "Daniel Brooks",
    phone: "07700 900177",
    email: "daniel@example.com",
    service: "Skylight leak",
    status: "Booked",
    source: "Phone",
    date: "2026-07-08",
    value: "900",
    notes: "Already booked for Friday."
  },
  {
    name: "Angela Martin",
    phone: "07700 900188",
    email: "angela@example.com",
    service: "Damp patch and roof inspection",
    status: "Ghosted",
    source: "MyBuilder",
    date: "2026-06-02",
    value: "2200",
    notes: "Mentioned damp patches on bedroom ceiling and wanted a second opinion."
  }
];

let leads = [];

const elements = {
  csvInput: document.querySelector("#csvInput"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  searchInput: document.querySelector("#searchInput"),
  priorityFilter: document.querySelector("#priorityFilter"),
  businessName: document.querySelector("#businessName"),
  bookingLink: document.querySelector("#bookingLink"),
  leadList: document.querySelector("#leadList"),
  template: document.querySelector("#leadCardTemplate"),
  totalLeads: document.querySelector("#totalLeads"),
  targetLeads: document.querySelector("#targetLeads"),
  pipelineValue: document.querySelector("#pipelineValue"),
  draftsReady: document.querySelector("#draftsReady"),
  copyAllButton: document.querySelector("#copyAllButton"),
  exportButton: document.querySelector("#exportButton")
};

function parseCsv(text) {
  const rows = [];
  let cell = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);

  const headers = rows.shift().map((header) => header.toLowerCase());
  return rows.map((values) => {
    const lead = {};
    headers.forEach((header, index) => {
      lead[header] = values[index] || "";
    });
    return lead;
  });
}

function daysSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 999;
  const now = new Date("2026-07-11T12:00:00");
  return Math.max(0, Math.round((now - date) / 86400000));
}

function scoreLead(lead) {
  const status = String(lead.status || "").toLowerCase();
  const notes = String(lead.notes || "").toLowerCase();
  const value = Number.parseFloat(lead.value || 0) || 0;
  const age = daysSince(lead.date);
  let score = 20;

  if (status.includes("quote")) score += 30;
  if (status.includes("ghost")) score += 25;
  if (status.includes("missed")) score += 25;
  if (status.includes("estimate")) score += 22;
  if (status.includes("booked") || status.includes("lost")) score -= 60;
  if (notes.includes("leak") || notes.includes("storm") || notes.includes("insurance")) score += 12;
  if (value >= 8000) score += 18;
  if (value >= 3000) score += 10;
  if (age <= 14) score += 14;
  if (age > 60) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getPriority(score) {
  if (score >= 72) return "hot";
  if (score >= 45) return "warm";
  return "review";
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Number.parseFloat(value || 0) || 0);
}

function makeDraft(lead) {
  const business = elements.businessName.value || "our team";
  const booking = elements.bookingLink.value || "our booking link";
  const firstName = String(lead.name || "there").split(" ")[0];
  const service = lead.service || "the roof work you asked about";
  const status = String(lead.status || "").toLowerCase();

  if (status.includes("missed")) {
    return `Hi ${firstName}, this is ${business}. We saw your missed call about ${service}. Do you still need help? We have a couple of call-back slots this week: ${booking}`;
  }

  if (status.includes("quote") || status.includes("estimate")) {
    return `Hi ${firstName}, this is ${business}. Just checking if you still wanted help with ${service}. If the timing is right, you can book a call-back here: ${booking}`;
  }

  return `Hi ${firstName}, this is ${business}. Following up on ${service}. Do you still want us to take a look or should we close this out? ${booking}`;
}

function hydrateLeads(rawLeads) {
  leads = rawLeads.map((lead, index) => {
    const score = scoreLead(lead);
    return {
      id: `${Date.now()}-${index}`,
      ...lead,
      score,
      priority: getPriority(score),
      draft: makeDraft(lead),
      approved: false
    };
  });
  render();
}

function refreshDrafts() {
  leads = leads.map((lead) => ({
    ...lead,
    draft: makeDraft(lead)
  }));
  render();
}

function getFilteredLeads() {
  const search = elements.searchInput.value.toLowerCase();
  const priority = elements.priorityFilter.value;

  return leads.filter((lead) => {
    const haystack = [lead.name, lead.service, lead.status, lead.source, lead.notes].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesPriority = priority === "all" || lead.priority === priority;
    return matchesSearch && matchesPriority;
  });
}

function updateSummary() {
  const targets = leads.filter((lead) => lead.score >= 45);
  const pipeline = targets.reduce((sum, lead) => sum + (Number.parseFloat(lead.value || 0) || 0), 0);
  const approved = leads.filter((lead) => lead.approved).length;

  elements.totalLeads.textContent = leads.length;
  elements.targetLeads.textContent = targets.length;
  elements.pipelineValue.textContent = formatMoney(pipeline);
  elements.draftsReady.textContent = approved;
}

function render() {
  updateSummary();
  elements.leadList.innerHTML = "";

  const filtered = getFilteredLeads();
  if (!filtered.length) {
    elements.leadList.innerHTML = '<div class="hint">No leads match this view. Upload a CSV or load the sample data.</div>';
    return;
  }

  filtered
    .sort((a, b) => b.score - a.score)
    .forEach((lead) => {
      const card = elements.template.content.cloneNode(true);
      const priority = lead.priority;

      card.querySelector(".lead-name").textContent = lead.name || "Unnamed lead";
      card.querySelector(".lead-meta").textContent = `${lead.service || "Unknown service"} · ${lead.status || "No status"} · ${lead.source || "Unknown source"}`;
      card.querySelector(".priority-pill").textContent = priority;
      card.querySelector(".priority-pill").classList.add(`priority-${priority}`);
      card.querySelector(".lead-score").textContent = `${lead.score}/100`;
      card.querySelector(".lead-value").textContent = formatMoney(lead.value);
      card.querySelector(".lead-date").textContent = lead.date || "Unknown";
      card.querySelector(".lead-notes").textContent = lead.notes || "No notes included.";

      const textarea = card.querySelector(".lead-draft");
      textarea.value = lead.draft;
      textarea.addEventListener("input", (event) => {
        lead.draft = event.target.value;
      });

      const checkbox = card.querySelector(".lead-approved");
      checkbox.checked = lead.approved;
      checkbox.addEventListener("change", (event) => {
        lead.approved = event.target.checked;
        updateSummary();
      });

      card.querySelector(".copy-draft-button").addEventListener("click", () => copyText(lead.draft));
      elements.leadList.appendChild(card);
    });
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function exportCsv() {
  const headers = ["name", "phone", "email", "service", "status", "source", "date", "value", "score", "priority", "approved", "draft"];
  const rows = leads.map((lead) =>
    headers.map((header) => `"${String(lead[header] || "").replaceAll('"', '""')}"`).join(",")
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-queue.csv";
  link.click();
  URL.revokeObjectURL(url);
}

elements.loadSampleButton.addEventListener("click", () => hydrateLeads(sampleLeads));
elements.csvInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  hydrateLeads(parseCsv(await file.text()));
});
elements.searchInput.addEventListener("input", render);
elements.priorityFilter.addEventListener("change", render);
elements.businessName.addEventListener("input", refreshDrafts);
elements.bookingLink.addEventListener("input", refreshDrafts);
elements.exportButton.addEventListener("click", exportCsv);
elements.copyAllButton.addEventListener("click", () => {
  const approvedDrafts = leads
    .filter((lead) => lead.approved)
    .map((lead) => `${lead.name}: ${lead.draft}`)
    .join("\n\n");
  copyText(approvedDrafts || "No approved drafts yet.");
});
document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.copyTarget}`);
    copyText(target.textContent.trim());
  });
});

hydrateLeads(sampleLeads);
