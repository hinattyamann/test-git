import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          test<span className="text-blue-600">.git</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Home
          </Link>

          <Link
            href="/browse"
            className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Browse
          </Link>

          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Logout
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}