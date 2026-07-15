import {
  ArrowLeft,
  Bot,
  CalendarClock,
  Mail,
  MessageSquarePlus,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addCompanyMessage,
  generateDraft,
  scheduleDraft,
  sendDraft,
  updateCompanyStatus,
  updateDraft,
} from "@/app/actions";
import {
  getCompany,
  listCompanyMessages,
  listEmailTasks,
} from "@/lib/database";

const statuses = [
  "Not contacted",
  "Contacted",
  "Replied",
  "Interested",
  "Won",
  "Lost",
];

const taskTypes = [
  ["first_follow_up", "First follow-up"],
  ["reply_next_step", "Reply next step"],
  ["polite_chaser", "Polite chaser"],
  ["close_the_loop", "Close the loop"],
];

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  const [messages, emailTasks] = await Promise.all([
    listCompanyMessages(company.id),
    listEmailTasks(company.id),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-[#d7ddd7] border-b bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd4cc]"
              href="/"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="font-extrabold text-[#176b4f] text-sm uppercase">
                Company
              </p>
              <h1 className="truncate font-black text-3xl tracking-normal">
                {company.name}
              </h1>
            </div>
          </div>
          <form action={updateCompanyStatus} className="flex gap-2">
            <input name="id" type="hidden" value={company.id} />
            <select
              className="min-h-10 rounded-md border border-[#cbd4cc] bg-white px-3"
              name="status"
              defaultValue={company.status}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#17211d] px-3 font-extrabold text-white"
              type="submit"
            >
              Save
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="grid content-start gap-4">
          <section className="rounded-lg border border-[#d7ddd7] bg-white p-4">
            <h2 className="font-extrabold text-xl">Snapshot</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              {[
                ["Niche", company.niche],
                [
                  "Location",
                  [company.city, company.county].filter(Boolean).join(", "),
                ],
                ["Owner", company.owner_or_manager],
                ["Email", company.email],
                ["Phone", company.phone],
                ["Website", company.website],
                ["Source", company.source],
              ].map(([label, value]) => (
                <div className="grid gap-1" key={label}>
                  <dt className="font-extrabold text-[#66736a]">{label}</dt>
                  <dd className="break-words">{value || "Not set"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-lg border border-[#d7ddd7] bg-white p-4">
            <h2 className="font-extrabold text-xl">Signal</h2>
            <p className="mt-3 text-[#3f4c43] leading-7">
              {company.lead_leak_signal}
            </p>
            <h3 className="mt-4 font-extrabold">Next step</h3>
            <p className="mt-1 text-[#3f4c43] leading-7">{company.next_step}</p>
            <h3 className="mt-4 font-extrabold">Notes</h3>
            <p className="mt-1 text-[#3f4c43] leading-7">{company.notes}</p>
          </section>
        </aside>

        <section className="grid gap-5">
          <div className="rounded-lg border border-[#d7ddd7] bg-white">
            <div className="flex items-center justify-between border-[#d7ddd7] border-b p-4">
              <h2 className="font-extrabold text-xl">Company thread</h2>
              <Bot size={20} aria-hidden="true" />
            </div>
            <div className="grid gap-3 p-4">
              {messages.length ? (
                messages.map((message) => (
                  <div
                    className={`max-w-[88%] rounded-lg px-4 py-3 ${
                      message.role === "me"
                        ? "justify-self-end bg-[#17211d] text-white"
                        : message.role === "them"
                          ? "justify-self-start bg-[#e7eef8] text-[#1d334f]"
                          : "justify-self-start bg-[#fff1c7] text-[#4f3900]"
                    }`}
                    key={message.id}
                  >
                    <p className="mb-1 font-extrabold text-xs uppercase">
                      {message.role}
                    </p>
                    <p className="whitespace-pre-wrap leading-7">
                      {message.body}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-[#f4f5f2] p-4 text-[#66736a]">
                  Add what you said, what they said back, or ask AI to reason
                  from the thread when generating the next draft.
                </p>
              )}
            </div>
            <form
              action={addCompanyMessage}
              className="grid gap-3 border-[#d7ddd7] border-t p-4"
            >
              <input name="company_id" type="hidden" value={company.id} />
              <div className="flex gap-2">
                <select
                  className="min-h-10 rounded-md border border-[#cbd4cc] bg-white px-3"
                  name="role"
                  defaultValue="me"
                >
                  <option value="me">Me</option>
                  <option value="them">Them</option>
                  <option value="ai">AI note</option>
                </select>
                <button
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#17211d] px-3 font-extrabold text-white"
                  type="submit"
                >
                  <MessageSquarePlus size={18} aria-hidden="true" />
                  Add
                </button>
              </div>
              <textarea
                className="min-h-28 rounded-md border border-[#cbd4cc] px-3 py-2"
                name="body"
                required
              />
            </form>
          </div>

          <div className="rounded-lg border border-[#d7ddd7] bg-white">
            <div className="flex items-center justify-between border-[#d7ddd7] border-b p-4">
              <h2 className="font-extrabold text-xl">Email tasks</h2>
              <Mail size={20} aria-hidden="true" />
            </div>
            <form
              action={generateDraft}
              className="flex flex-wrap items-center gap-2 border-[#d7ddd7] border-b p-4"
            >
              <input name="company_id" type="hidden" value={company.id} />
              <select
                className="min-h-10 rounded-md border border-[#cbd4cc] bg-white px-3"
                name="task_type"
                defaultValue="first_follow_up"
              >
                {taskTypes.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#176b4f] px-3 font-extrabold text-white"
                type="submit"
              >
                <Sparkles size={18} aria-hidden="true" />
                Generate draft
              </button>
            </form>
            <div className="grid gap-4 p-4">
              {emailTasks.map((task) => (
                <article
                  className="grid gap-3 rounded-lg border border-[#d7ddd7] bg-[#fbfcfa] p-4"
                  key={task.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{task.task_type.replaceAll("_", " ")}</strong>
                    <span className="rounded-full bg-[#ecefeb] px-2.5 py-1 font-extrabold text-[#4d5a51] text-xs uppercase">
                      {task.status}
                    </span>
                  </div>
                  <form action={updateDraft} className="grid gap-3">
                    <input name="id" type="hidden" value={task.id} />
                    <input name="company_id" type="hidden" value={company.id} />
                    <label className="grid gap-1 font-bold text-sm">
                      To
                      <input
                        className="min-h-10 rounded-md border border-[#cbd4cc] bg-white px-3 font-normal"
                        name="recipient"
                        defaultValue={task.recipient ?? ""}
                      />
                    </label>
                    <label className="grid gap-1 font-bold text-sm">
                      Subject
                      <input
                        className="min-h-10 rounded-md border border-[#cbd4cc] bg-white px-3 font-normal"
                        name="subject"
                        defaultValue={task.subject}
                      />
                    </label>
                    <label className="grid gap-1 font-bold text-sm">
                      Body
                      <textarea
                        className="min-h-44 rounded-md border border-[#cbd4cc] bg-white px-3 py-2 font-normal"
                        name="body"
                        defaultValue={task.body}
                      />
                    </label>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd4cc] bg-white px-3 font-extrabold"
                      type="submit"
                    >
                      <Save size={17} aria-hidden="true" />
                      Save draft
                    </button>
                  </form>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <form action={scheduleDraft} className="flex gap-2">
                      <input name="id" type="hidden" value={task.id} />
                      <input
                        name="company_id"
                        type="hidden"
                        value={company.id}
                      />
                      <input
                        className="min-h-10 min-w-0 flex-1 rounded-md border border-[#cbd4cc] bg-white px-3"
                        name="scheduled_for"
                        type="datetime-local"
                        required
                      />
                      <button
                        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cbd4cc] bg-white px-3 font-extrabold"
                        type="submit"
                      >
                        <CalendarClock size={17} aria-hidden="true" />
                        Schedule
                      </button>
                    </form>
                    <form action={sendDraft}>
                      <input name="id" type="hidden" value={task.id} />
                      <input
                        name="company_id"
                        type="hidden"
                        value={company.id}
                      />
                      <button
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#17211d] px-3 font-extrabold text-white"
                        type="submit"
                      >
                        <Send size={17} aria-hidden="true" />
                        Send
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
