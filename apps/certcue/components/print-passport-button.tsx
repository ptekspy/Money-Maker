"use client";

import { Printer } from "lucide-react";

export function PrintPassportButton() {
  return (
    <button
      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#18220d] px-4 font-black text-white"
      onClick={() => window.print()}
      type="button"
    >
      <Printer size={18} /> Print or save PDF
    </button>
  );
}
