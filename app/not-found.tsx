import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[70svh] place-items-center px-4 py-20 text-center">
        <div className="max-w-xl">
          <p className="mb-3 font-extrabold text-[#176b4f] text-sm uppercase">
            Page not found
          </p>
          <h1 className="mb-4 text-5xl leading-none">
            This recovery page is not live yet.
          </h1>
          <p className="mb-8 text-[#5d6c67] leading-7">
            The generic QuoteWinBack homepage is ready, and new local trade
            pages can be added quickly.
          </p>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#102820] px-4 font-extrabold text-white"
            href="/"
          >
            Go home
          </Link>
        </div>
      </main>
    </>
  );
}
