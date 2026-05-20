import Link from "next/link";

type BreadcrumbProps = {
  path: string;
};

export default function Breadcrumb({ path }: BreadcrumbProps) {
  const segments = path ? path.split("/") : [];

  return (
    <nav
      className="mb-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm"
      aria-label="現在の場所"
    >
      <ol className="flex min-w-max items-center gap-1">
        <li>
          <Link
            href="/browse"
            className="focus-ring inline-flex min-h-8 items-center rounded-lg px-3 font-bold text-blue-700 transition hover:bg-blue-50"
          >
            ルート
          </Link>
        </li>

        {segments.map((segment, index) => {
          const accumulatedPath = segments.slice(0, index + 1).join("/");

          return (
            <li key={accumulatedPath} className="flex items-center gap-1">
              <span className="px-1 text-slate-300">/</span>
              <Link
                href={`/browse?path=${encodeURIComponent(accumulatedPath)}`}
                className="focus-ring inline-flex min-h-8 items-center rounded-lg px-3 font-bold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
              >
                {segment}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
