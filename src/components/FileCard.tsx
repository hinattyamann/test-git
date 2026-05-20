import Link from "next/link";
import { getViewableFileLabel, getViewableFileType } from "@/lib/viewable-files";
import type { GitHubContentItem } from "@/types/github";

type FileCardProps = {
  item: GitHubContentItem;
};

function formatSize(size: number) {
  if (!size) return "";

  const mb = size / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function FileCard({ item }: FileCardProps) {
  const isDirectory = item.type === "dir";
  const size = !isDirectory ? formatSize(item.size) : "";
  const fileType = getViewableFileType(item.name);
  const label = getViewableFileLabel(item.name);

  const href = isDirectory
    ? `/browse?path=${encodeURIComponent(item.path)}`
    : `/viewer?path=${encodeURIComponent(item.path)}`;

  return (
    <Link
      href={href}
      className="focus-ring group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
          isDirectory
            ? "bg-amber-50 ring-amber-100"
            : fileType?.kind === "image"
            ? "bg-emerald-50 ring-emerald-100"
            : "bg-red-50 ring-red-100"
        }`}
        aria-hidden="true"
      >
        {isDirectory ? (
          <span className="relative block h-6 w-7 rounded-md border-2 border-amber-600 bg-amber-100 before:absolute before:-top-2 before:left-0 before:h-2 before:w-4 before:rounded-t-md before:border-2 before:border-b-0 before:border-amber-600 before:bg-amber-100 before:content-['']" />
        ) : fileType?.kind === "image" ? (
          <span className="relative block h-7 w-7 rounded-md border-2 border-emerald-600 bg-white after:absolute after:bottom-1 after:left-1 after:h-2 after:w-4 after:skew-x-[-18deg] after:rounded-sm after:bg-emerald-100 after:content-['']" />
        ) : (
          <span className="relative block h-7 w-5 rounded-sm border-2 border-red-600 bg-white after:absolute after:-right-0.5 after:-top-0.5 after:h-2 after:w-2 after:border-b-2 after:border-l-2 after:border-red-600 after:bg-red-50 after:content-['']" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-slate-950 group-hover:text-blue-700">
          {item.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <span>{isDirectory ? "フォルダ" : `${label}ファイル`}</span>
          {size && (
            <>
              <span className="text-slate-300">/</span>
              <span>{size}</span>
            </>
          )}
        </div>
      </div>

      <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
        ›
      </span>
    </Link>
  );
}
