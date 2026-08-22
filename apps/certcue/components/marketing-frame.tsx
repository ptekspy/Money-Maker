import type { ReactNode } from "react";
import { ProductHuntBadge } from "@/components/product-hunt-badge";

type MarketingFrameProps = {
  children: ReactNode;
};

export function MarketingFrame({ children }: MarketingFrameProps) {
  return (
    <>
      <header className="flex min-h-18 items-center justify-between border-[#d5dbc9] border-b bg-[#f4f5ef]/95 px-4 md:px-8">
        <a className="font-black text-xl tracking-tight" href="/">
          Let<span className="text-[#52720d]">Due</span>
        </a>
        <nav className="flex items-center gap-4 font-bold text-sm md:gap-6">
          <a className="hidden text-[#5e6b55] sm:inline" href="/#tools">
            Free tools
          </a>
          <a
            className="rounded-lg bg-[#18220d] px-4 py-3 text-white"
            href="/#audit"
          >
            Check a property
          </a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="flex flex-wrap justify-between gap-4 border-[#d5dbc9] border-t px-4 py-7 font-bold text-[#687260] text-sm md:px-8">
        <a className="text-[#18220d]" href="/">
          LetDue
        </a>
        <span>Compliance information, not legal advice · England beta</span>
        <span className="flex gap-4">
          <a href="/founding-plan">Founding plan</a>
          <a href="/partners/certificate-aftercare">Partners</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </span>
        <a href="mailto:hello@letdue.com">hello@letdue.com</a>
        <span className="basis-full font-medium leading-6">
          LetDue is owned and operated by{" "}
          <a
            className="font-bold underline"
            href="https://find-and-update.company-information.service.gov.uk/company/17381031"
            rel="noreferrer"
            target="_blank"
          >
            Paddy Systems Ltd
          </a>
          , registered in England and Wales. Company no. 17381031. Registered
          office: 66 Paul Street, London, EC2A 4NA.
        </span>
        <ProductHuntBadge />
      </footer>
    </>
  );
}
