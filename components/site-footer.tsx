import Link from "next/link";
import { deleteDataHref } from "@/lib/landing-data";

export function SiteFooter() {
  return (
    <footer className="flex flex-col justify-between gap-4 border-[#d8e2de] border-t bg-white px-4 py-7 font-bold text-[#5d6c67] md:flex-row md:items-center md:px-8">
      <span className="text-[#102820]">QuoteWinBack</span>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href={deleteDataHref()}>Delete data</a>
        <a href="mailto:hello@quotewinback.co.uk">hello@quotewinback.co.uk</a>
      </div>
    </footer>
  );
}
