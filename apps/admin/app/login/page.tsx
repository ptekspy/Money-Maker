import { LockKeyhole } from "lucide-react";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        action={login}
        className="grid w-full max-w-sm gap-5 rounded-lg border border-[#d7ddd7] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#17211d] text-white">
            <LockKeyhole size={20} aria-hidden="true" />
          </div>
          <h1 className="font-extrabold text-2xl">QuoteWinBack Admin</h1>
        </div>
        <label className="grid gap-2 font-bold text-sm">
          Password
          <input
            className="min-h-11 rounded-md border border-[#cbd4cc] px-3 font-normal"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {params.error ? (
          <p className="rounded-md bg-[#fff1c7] px-3 py-2 font-bold text-[#6d4b00] text-sm">
            That password did not match.
          </p>
        ) : null}
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#17211d] px-4 font-extrabold text-white"
          type="submit"
        >
          Unlock
        </button>
      </form>
    </main>
  );
}
