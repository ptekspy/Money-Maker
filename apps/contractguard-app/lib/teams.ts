import {
  getWorkspace,
  getWorkspaceMember,
  listWorkspaceMembers,
  type WorkspaceRole,
} from "@/lib/data";
import { requiredEnv } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export const TEAM_ROLES: Array<{
  value: Exclude<WorkspaceRole, "owner">;
  label: string;
  description: string;
}> = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage members, installations and day-to-day settings.",
  },
  {
    value: "developer",
    label: "Developer",
    description: "View repositories and checks.",
  },
  {
    value: "billing",
    label: "Billing",
    description: "View the workspace and manage Stripe billing.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to shared results.",
  },
];

export function workspaceRole(value: string) {
  return TEAM_ROLES.some((role) => role.value === value)
    ? (value as Exclude<WorkspaceRole, "owner">)
    : "developer";
}

export function canManageMembers(role: WorkspaceRole) {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: WorkspaceRole) {
  return role === "owner" || role === "billing";
}

export async function workspaceAccess(workspaceId: string, userId: number) {
  const [workspace, member] = await Promise.all([
    getWorkspace(workspaceId),
    getWorkspaceMember(workspaceId, userId),
  ]);
  return workspace && member ? { member, workspace } : null;
}

export async function syncWorkspaceSeatBilling(workspaceId: string) {
  const [workspace, members] = await Promise.all([
    getWorkspace(workspaceId),
    listWorkspaceMembers(workspaceId),
  ]);
  if (!workspace?.stripeSubscriptionId || workspace.billingStatus !== "active")
    return;

  const extraSeats = Math.max(0, members.length - PLANS.teams.includedSeats);
  const seatPriceId = requiredEnv("STRIPE_CONTRACTGUARD_TEAMS_SEAT_PRICE_ID");
  const subscription = await stripe().subscriptions.retrieve(
    workspace.stripeSubscriptionId,
  );
  const subscriptionSeatItem = subscription.items.data.find(
    (item) => item.price.id === seatPriceId,
  );
  const seatItemId =
    subscriptionSeatItem?.id || workspace.stripeSeatSubscriptionItemId;
  if (seatItemId) {
    if (extraSeats === 0) {
      await stripe().subscriptionItems.del(seatItemId, {
        proration_behavior: "create_prorations",
      });
    } else if (subscriptionSeatItem?.quantity !== extraSeats) {
      await stripe().subscriptionItems.update(seatItemId, {
        quantity: extraSeats,
        proration_behavior: "create_prorations",
      });
    }
    return;
  }
  if (extraSeats > 0) {
    await stripe().subscriptionItems.create({
      subscription: workspace.stripeSubscriptionId,
      price: seatPriceId,
      quantity: extraSeats,
      proration_behavior: "create_prorations",
    });
  }
}
