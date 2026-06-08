import Link from "next/link";
import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import { getRepositoryContents } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let departments: { name: string; path: string }[] = [];
  let errorMessage = "";

  try {
    const items = await getRepositoryContents("");

    departments = items
      .filter((item) => item.type === "dir")
      .map((item) => ({
        name: item.name,
        path: item.path,
      }));
  } catch (error) {
    console.error(error);
    errorMessage = "GitHub リポジトリから学科一覧を取得できませんでした。";
  }

  return (
    <main className="app-shell min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          {/* <div className="mb-5 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            過去問ライブラリ
          </div> */}

          <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            test.git
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            専攻科の過去問を検索・閲覧。
          </p>

          <div className="mx-auto mt-8 max-w-3xl text-left">
            <SearchBox />
          </div>
        </div>

        <section className="mt-12">
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold text-blue-700">Study Tool</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  英単語学習
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  登録済みの英単語から意味を答える学習ツール。
                </p>
              </div>

              <Link
                href="/english"
                className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                英単語を学習
              </Link>
            </div>
          </div>

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold text-blue-700">Departments</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                学科一覧
              </h2>
              {/* <p className="mt-2 text-sm leading-6 text-slate-500">学年・科目別</p> */}
            </div>

            <Link
              href="/browse"
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              全体を見る
            </Link>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {!errorMessage && departments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-500 shadow-sm">
              学科フォルダが見つかりませんでした。GitHub
              リポジトリ直下にフォルダを作成してください。
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <Link
                key={department.path}
                href={`/browse?path=${encodeURIComponent(department.path)}`}
                className="focus-ring group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <span className="h-5 w-7 rounded-sm border-2 border-blue-700 border-t-4" />
                  </div>
                  <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                    ›
                  </span>
                </div>

                <h3 className="truncate text-lg font-black text-slate-950 group-hover:text-blue-700">
                  {department.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  学年・科目・資料を開く
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
