"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import FileCard from "@/components/FileCard";
import { isViewableFile } from "@/lib/viewable-files";
import type {
  ApiErrorResponse,
  GitHubContentItem,
  GitHubContentsApiResponse,
} from "@/types/github";

type FileTreeProps = {
  path: string;
};

export default function FileTree({ path }: FileTreeProps) {
  const [items, setItems] = useState<GitHubContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadContents() {
      try {
        setLoading(true);
        setError("");

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

        if (!ignore) {
          setItems("items" in data ? data.items : []);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setError("ファイル一覧を取得できませんでした。");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadContents();

    return () => {
      ignore = true;
    };
  }, [path]);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => item.type === "dir" || isViewableFile(item))
      .sort((a, b) => {
        if (a.type === "dir" && b.type !== "dir") return -1;
        if (a.type !== "dir" && b.type === "dir") return 1;

        return a.name.localeCompare(b.name, "ja");
      });
  }, [items]);

  const directoryCount = visibleItems.filter(
    (item) => item.type === "dir"
  ).length;
  const fileCount = visibleItems.filter((item) => isViewableFile(item)).length;

  return (
    <div>
      <Breadcrumb path={path} />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && visibleItems.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm leading-6 text-slate-500 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <span className="h-5 w-6 rounded-sm border-2 border-slate-400" />
          </div>
          表示できるフォルダまたは閲覧可能ファイルがありません。
        </div>
      )}

      {!loading && !error && visibleItems.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              フォルダ {directoryCount}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              ファイル {fileCount}
            </span>
          </div>

          <div className="grid gap-3">
            {visibleItems.map((item) => (
              <FileCard key={item.sha + item.path} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
