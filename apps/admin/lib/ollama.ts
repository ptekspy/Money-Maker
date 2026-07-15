import type { Company, CompanyMessage } from "@/lib/database";

export async function generateEmailDraft(
  company: Company,
  messages: CompanyMessage[],
  taskType: string,
) {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "https://ollama.tik-track.com";
  const model = process.env.OLLAMA_MODEL ?? "llama3.1";
  const recentMessages = messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.body}`)
    .join("\n");

  const prompt = `Write a concise UK B2B outreach email for QuoteWinBack.

Task: ${taskType}
Company: ${company.name}
Niche: ${company.niche ?? "Unknown"}
Location: ${[company.city, company.county].filter(Boolean).join(", ")}
Lead leak signal: ${company.lead_leak_signal ?? "Unknown"}
Next step: ${company.next_step ?? "Unknown"}
Notes: ${company.notes ?? ""}
Conversation so far:
${recentMessages || "No conversation yet."}

Return only:
Subject: ...

Email:
...`;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with ${response.status}.`);
  }

  const data = (await response.json()) as { response?: string };
  const text = data.response?.trim() ?? "";
  const subjectMatch = text.match(/^Subject:\s*(.+)$/im);
  const emailMatch = text.match(/Email:\s*([\s\S]+)$/i);

  return {
    subject: subjectMatch?.[1]?.trim() || `Quick question for ${company.name}`,
    body: (emailMatch?.[1] ?? text).trim(),
  };
}
