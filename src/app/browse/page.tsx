import Header from "@/components/Header";
import FileTree from "@/components/FileTree";

type BrowsePageProps = {
  searchParams?: Promise<{ path?: string }> | { path?: string };
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const currentPath = params?.path || "";
  const title = currentPath ? currentPath.split("/").pop() : "すべてのフォルダ";

  return (
    <main className="app-shell min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold text-blue-700">Browse</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">ファイル一覧</p>
            </div>

            <p className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {currentPath || "root"}
            </p>
          </div>
        </div>

        <FileTree path={currentPath} />
      </section>
    </main>
  );
}
