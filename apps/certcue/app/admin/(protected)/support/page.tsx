import { listSupportRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const requests = await listSupportRequests();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="font-black text-[#52720d] text-xs uppercase tracking-[0.16em]">
        Customer care
      </p>
      <h1 className="mt-2 text-4xl">Support</h1>
      <p className="mt-2 text-[#65715d]">
        The newest 30 contact and in-dashboard requests. History starts with
        this admin release; earlier requests remain in the support inbox.
      </p>

      <section className="mt-7 grid gap-4">
        {requests.map((request) => (
          <article
            className="rounded-2xl border border-[#d5dbc9] bg-white p-6"
            key={request.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[#eef0e7] px-2.5 py-1 font-black text-[#52720d] text-xs uppercase">
                  {request.source}
                </span>
                <h2 className="mt-3 text-xl">{request.subject}</h2>
                <p className="mt-1 text-[#65715d] text-sm">
                  {request.name ? `${request.name} · ` : ""}
                  <a className="underline" href={`mailto:${request.email}`}>
                    {request.email}
                  </a>
                </p>
              </div>
              <time
                className="text-[#65715d] text-sm"
                dateTime={request.createdAt}
              >
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(request.createdAt))}
              </time>
            </div>
            <p className="mt-5 whitespace-pre-wrap rounded-xl bg-[#f7f8f3] p-4 leading-7">
              {request.message}
            </p>
            {request.context ? (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-black">
                  Request context
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-[#18220d] p-4 font-mono text-[#e9eee3] text-xs leading-6">
                  {request.context}
                </pre>
              </details>
            ) : null}
          </article>
        ))}
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-[#d5dbc9] bg-white p-8 text-center text-[#65715d]">
            No stored requests yet. New submissions will appear here and still
            be emailed.
          </div>
        ) : null}
      </section>
    </main>
  );
}
