import type { AnchorHTMLAttributes } from "react";
import type { MarketingEvent } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: MarketingEvent;
  campaign: string;
};

export function TrackedLink({ event, campaign, ...props }: TrackedLinkProps) {
  return (
    <a {...props} data-track-campaign={campaign} data-track-event={event} />
  );
}
