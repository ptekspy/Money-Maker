import Link from "next/link";

export default function SetupRequiredPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-xl rounded-2xl border border-[#d5dbc9] bg-white p-8 text-center">
        <p className="font-black text-[#ad4f22] text-sm uppercase">
          Early access
        </p>
        <h1 className="mt-3 text-4xl">Checkout is being connected.</h1>
        <p className="mt-4 text-[#65715d] leading-7">
          The product is not taking payment until monitoring and billing are
          fully connected. Leave your email and we will notify you when it
          opens.
        </p>
        <a
          className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-[#18220d] px-5 font-black text-white"
          href="mailto:hello@letdue.com?subject=LetDue early access"
        >
          Request early access
        </a>
        <Link className="mt-4 block font-bold text-[#52720d]" href="/">
          Back to the free audit
        </Link>
      </section>
    </main>
  );
}
