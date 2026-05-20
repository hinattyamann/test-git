"use client";

import Link from "next/link";
import { useState } from "react";
import { getViewableFileLabel, isViewableFile } from "@/lib/viewable-files";
import type {
  ApiErrorResponse,
  GitHubContentItem,
  GitHubContentsApiResponse,
} from "@/types/github";

function getReadablePath(path: string) {
  const segments = path.split("/");

  if (segments.length <= 1) return "ルート";

  return segments.slice(0, -1).join(" / ");
}

async function fetchContents(path: string) {
  const response = await fetch(
    `/api/github/contents?path=${encodeURIComponent(path)}`,
    {
      cache: "no-store",
    }
  );

  const data = (await response.json()) as
    | GitHubContentsApiResponse
    | ApiErrorResponse;

  if (!response.ok) {
    throw new Error("message" in data ? data.message : "取得失敗");
  }

  return "items" in data ? data.items : [];
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GitHubContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const found: GitHubContentItem[] = [];
      const maxResults = 50;

      async function walk(path: string) {
        if (found.length >= maxResults) return;

        const items = await fetchContents(path);

        for (const item of items) {
          if (found.length >= maxResults) return;

          if (item.type === "dir") {
            await walk(item.path);
            continue;
          }

          if (isViewableFile(item)) {
            // ファイル名だけでなくパスも検索対象にすると、
            // 「数学」「物理」のような科目フォルダ名でも探せる
            const searchTarget = `${item.name} ${item.path}`.toLowerCase();

            if (searchTarget.includes(keyword)) {
              found.push(item);
            }
          }
        }
      }

      await walk("");

      setResults(found);
    } catch (error) {
      console.error(error);
      setError("検索中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-2 sm:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-white px-4 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-600">
          <span className="relative h-4 w-4 shrink-0 rounded-full border-2 border-slate-400">
            <span className="absolute -bottom-1.5 -right-1 block h-2 w-0.5 -rotate-45 rounded-full bg-slate-400" />
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="数学、物理、電気回路、B1..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            aria-label="過去問を検索"
          />
        </label>

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="focus-ring min-h-12 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "検索中" : "検索"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {searched && !loading && !error && results.length === 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
          該当する閲覧可能ファイルは見つかりませんでした。
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 px-1 text-xs font-bold text-slate-500">
            検索結果：{results.length}件
          </p>

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {results.map((item) => (
              <Link
                key={item.sha + item.path}
                href={`/viewer?path=${encodeURIComponent(item.path)}`}
                className="focus-ring group block rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-black text-red-700 ring-1 ring-red-100">
                    {getViewableFileLabel(item.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-950 group-hover:text-blue-700">
                      {item.name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {getReadablePath(item.path)}
                    </span>
                  </span>
                  <span className="text-xl leading-7 text-slate-300 group-hover:text-blue-600">
                    ›
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
