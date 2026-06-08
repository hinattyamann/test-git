import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();
  const user = session?.user;
  const displayName = user?.name || user?.email || "ログインユーザー";
  const displayInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          test<span className="text-blue-600">.git</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-2 text-sm">
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

          <Link
            href="/english"
            className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            English
          </Link>

          {user && (
            <div className="ml-1 flex min-w-0 items-center gap-3 border-l border-slate-200 pl-3">
              <div
                className="flex min-w-0 items-center gap-2"
                aria-label="現在ログインしているユーザー"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {displayInitial}
                </span>

                <div className="hidden min-w-0 leading-tight sm:block">
                  <p className="text-[11px] font-bold text-slate-400">
                    ログイン中
                  </p>
                  <p className="max-w-40 truncate text-sm font-bold text-slate-800">
                    {displayName}
                  </p>
                  {user.email && (
                    <p className="max-w-40 truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

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
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
