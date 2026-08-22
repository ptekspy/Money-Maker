import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const user = await requireUser();
  const { billing } = await searchParams;
  const query = billing ? `?billing=${encodeURIComponent(billing)}` : "";
  redirect(`/dashboard/${user.accessToken}${query}`);
}
