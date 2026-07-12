import Image from "next/image";
import Link from "next/link";
import { mailtoHref } from "@/lib/landing-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 grid min-h-17 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-[#d8e2de] border-b bg-white/95 px-4 py-3 backdrop-blur md:flex md:min-h-18 md:justify-between md:px-8 md:py-0">
      <Link
        className="flex min-w-0 items-center gap-2.5 font-extrabold text-lg"
        href="/"
        aria-label="QuoteWinBack home"
      >
        <Image
          src="/logo.svg"
          width={44}
          height={32}
          alt=""
          aria-hidden="true"
          className="h-8 w-11 rounded object-cover object-left"
          priority
        />
        <span className="truncate">QuoteWinBack</span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-6 font-bold text-[#5d6c67] text-sm md:flex"
      >
        <Link href="/#how">How it works</Link>
        <Link href="/#proof">What you get</Link>
        <Link href="/#pilot">Pilot</Link>
        <Link href="/bradford/roofers">Bradford roofers</Link>
      </nav>
      <a
        className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#102820] px-3 font-extrabold text-white md:min-h-11 md:px-4"
        href={mailtoHref()}
      >
        Start scan
      </a>
    </header>
  );
}
