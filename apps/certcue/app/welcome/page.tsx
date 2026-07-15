import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-xl rounded-2xl border border-[#d5dbc9] bg-white p-8 text-center">
        <p className="font-black text-[#52720d] text-sm uppercase">
          Monitoring active
        </p>
        <h1 className="mt-3 text-4xl">Welcome to LetDue.</h1>
        <p className="mt-4 text-[#65715d] leading-7">
          Your property is being added now. We have emailed your private
          dashboard link to the address used at checkout.
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
          href="/"
        >
          Back to LetDue
        </Link>
      </section>
    </main>
  );
}
