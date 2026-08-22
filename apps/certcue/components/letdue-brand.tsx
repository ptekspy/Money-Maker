import type { ReactNode } from "react";

type BrandProps = {
  className?: string;
  suffix?: ReactNode;
  theme?: "light" | "dark";
};

export function LetDueMark({
  className = "h-10 w-10",
  theme = "light",
}: Omit<BrandProps, "suffix">) {
  const lowerBar = theme === "dark" ? "#687260" : "#d5dbc9";

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 48 48"
    >
      <rect fill="#18220d" height="17" rx="6" width="40" x="4" y="4" />
      <rect fill={lowerBar} height="17" rx="6" width="40" x="4" y="27" />
      <rect fill="#f4f5ef" height="3" rx="1.5" width="13" x="10" y="11" />
      <rect fill="#f4f5ef" height="3" rx="1.5" width="9" x="10" y="34" />
      <circle cx="36" cy="35.5" fill="#d9ff73" r="5.5" />
    </svg>
  );
}

export function LetDueLogo({
  className = "",
  suffix,
  theme = "light",
}: BrandProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LetDueMark className="h-9 w-9 shrink-0" theme={theme} />
      <span
        className={`font-black text-xl tracking-[-0.04em] ${theme === "dark" ? "text-white" : "text-[#18220d]"}`}
      >
        LetDue
      </span>
      {suffix}
    </span>
  );
}

export function PaddySystemsEndorsement({
  className = "",
}: {
  className?: string;
}) {
  return (
    <a
      className={`font-mono font-bold text-[10px] text-[#687260] uppercase tracking-[0.12em] hover:text-[#18220d] ${className}`}
      href="https://paddy.systems"
      rel="noreferrer"
      target="_blank"
    >
      A Paddy Systems company
    </a>
  );
}
