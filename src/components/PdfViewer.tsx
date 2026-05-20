"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PdfDocumentViewer from "@/components/PdfDocumentViewer";
import { getViewableFileType } from "@/lib/viewable-files";
import type {
  ApiErrorResponse,
  GitHubContentItem,
  GitHubContentsApiResponse,
} from "@/types/github";

type PdfViewerProps = {
  path: string;
};

export default function PdfViewer({ path }: PdfViewerProps) {
  const router = useRouter();

  const [file, setFile] = useState<GitHubContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [frameLoading, setFrameLoading] = useState(true);
  const [error, setError] = useState("");

  const fileName = useMemo(() => {
    if (!path) return "ファイル";
    return path.split("/").pop() || "ファイル";
  }, [path]);

  const rawFileUrl = useMemo(() => {
    return `/api/github/raw?path=${encodeURIComponent(path)}`;
  }, [path]);

  const fileType = useMemo(() => {
    return getViewableFileType(file?.name || path);
  }, [file?.name, path]);

  useEffect(() => {
    let ignore = false;

    async function loadFileInfo() {
      if (!path) {
        setError("ファイルのパスが指定されていません。");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFrameLoading(true);
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

        const firstItem = "items" in data ? data.items[0] : null;

        if (!firstItem || firstItem.type !== "file") {
          throw new Error("ファイルが見つかりません。");
        }

        if (!getViewableFileType(firstItem.name)) {
          throw new Error("対応していないファイル形式です。");
        }

        if (!ignore) {
          setFile(firstItem);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setError("ファイル情報を取得できませんでした。");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadFileInfo();

    return () => {
      ignore = true;
    };
  }, [path]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-[70vh] animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
        <p>{error}</p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="focus-ring rounded-xl bg-white px-4 py-2 font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold text-red-700">
              {fileType?.kind === "image" ? "Image Preview" : "PDF Preview"}
            </p>
            <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl">
              {file?.name || fileName}
            </h1>
            <p className="mt-2 truncate text-sm text-slate-500">{path}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="focus-ring min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              戻る
            </button>

            <a
              href={`${rawFileUrl}&download=1`}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              ダウンロード
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">閲覧</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {fileType?.label || "FILE"}
          </span>
          {file?.size ? (
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {frameLoading && fileType?.kind === "image" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white text-sm font-medium text-slate-500">
            プレビューを読み込み中です...
          </div>
        )}

        {fileType?.kind === "image" ? (
          <div className="flex h-[76vh] min-h-[520px] items-center justify-center overflow-auto bg-slate-100 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rawFileUrl}
              alt={file?.name || fileName}
              className="max-h-full max-w-full rounded-lg bg-white object-contain shadow-sm"
              onLoad={() => setFrameLoading(false)}
              onError={() => {
                setFrameLoading(false);
                setError("画像プレビューを読み込めませんでした。");
              }}
            />
          </div>
        ) : fileType?.kind === "pdf" ? (
          <PdfDocumentViewer src={rawFileUrl} title={file?.name || fileName} />
        ) : (
          <div className="flex min-h-[520px] items-center justify-center bg-slate-100 p-6 text-sm font-medium text-slate-500">
            このファイルはプレビューできません。
          </div>
        )}
      </div>
    </div>
  );
}
