import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#eef0e7]">
      <header className="border-[#34412d] border-b bg-[#18220d] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-7">
            <Link className="font-black text-xl" href="/admin">
              Let<span className="text-[#d9ff73]">Due</span> Admin
            </Link>
            <nav className="flex items-center gap-4 font-bold text-[#cbd4c5] text-sm">
              <Link href="/admin">Customers</Link>
              <Link href="/admin/support">Support</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[#cbd4c5] sm:inline">
              {admin.email}
            </span>
            <form action={logoutAdmin}>
              <button
                className="min-h-10 rounded-lg border border-[#5b6a52] px-3 font-black"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
