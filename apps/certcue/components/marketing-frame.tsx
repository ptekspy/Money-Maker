import type { ReactNode } from "react";

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
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </span>
        <a href="mailto:hello@letdue.com">hello@letdue.com</a>
      </footer>
    </>
  );
}
