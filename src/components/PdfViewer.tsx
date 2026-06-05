"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEyeOff,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";
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

type RedSheetSize = {
  width: number;
  height: number;
};

type SiblingNavControlProps = {
  direction: "previous" | "next";
  file?: GitHubContentItem;
  loading: boolean;
};

const INITIAL_RED_SHEET_SIZE: RedSheetSize = {
  width: 800,
  height: 200,
};

function buildViewerHref(path: string) {
  return `/viewer?path=${encodeURIComponent(path)}`;
}

function SiblingNavControl({
  direction,
  file,
  loading,
}: SiblingNavControlProps) {
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? FiArrowLeft : FiArrowRight;
  const label = loading
    ? "読み込み中"
    : isPrevious
    ? "前のファイル"
    : "次のファイル";
  const baseClassName =
    "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition";

  if (!file) {
    return (
      <button
        type="button"
        disabled
        className={`${baseClassName} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 ${
          isPrevious ? "" : "justify-end"
        }`}
      >
        {isPrevious && <Icon className="h-5 w-5" aria-hidden="true" />}
        <span>{label}</span>
        {!isPrevious && <Icon className="h-5 w-5" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <Link
      href={buildViewerHref(file.path)}
      aria-label={`${isPrevious ? "前" : "次"}のファイルへ移動`}
      className={`${baseClassName} border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 ${
        isPrevious ? "" : "justify-end"
      }`}
    >
      {isPrevious && <Icon className="h-5 w-5" aria-hidden="true" />}
      <span>{label}</span>
      {!isPrevious && <Icon className="h-5 w-5" aria-hidden="true" />}
    </Link>
  );
}

export default function PdfViewer({ path }: PdfViewerProps) {
  const router = useRouter();

  const [file, setFile] = useState<GitHubContentItem | null>(null);
  const [siblingFiles, setSiblingFiles] = useState<GitHubContentItem[]>([]);
  const [siblingLoading, setSiblingLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [frameLoading, setFrameLoading] = useState(true);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [redSheetEnabled, setRedSheetEnabled] = useState(false);
  const [redSheetSize, setRedSheetSize] = useState<RedSheetSize>(
    INITIAL_RED_SHEET_SIZE
  );

  const fileName = useMemo(() => {
    if (!path) return "ファイル";
    return path.split("/").pop() || "ファイル";
  }, [path]);

  const rawFileUrl = useMemo(() => {
    return `/api/github/raw?path=${encodeURIComponent(path)}`;
  }, [path]);

  const parentPath = useMemo(() => {
    const segments = path.split("/").filter(Boolean);
    segments.pop();

    return segments.join("/");
  }, [path]);

  const fileType = useMemo(() => {
    return getViewableFileType(file?.name || path);
  }, [file?.name, path]);

  const currentSiblingIndex = useMemo(() => {
    const currentPath = file?.path || path;

    return siblingFiles.findIndex((siblingFile) => {
      return siblingFile.path === currentPath;
    });
  }, [file?.path, path, siblingFiles]);

  const previousFile =
    currentSiblingIndex > 0 ? siblingFiles[currentSiblingIndex - 1] : undefined;
  const nextFile =
    currentSiblingIndex >= 0 && currentSiblingIndex < siblingFiles.length - 1
      ? siblingFiles[currentSiblingIndex + 1]
      : undefined;
  const siblingPosition =
    currentSiblingIndex >= 0
      ? `${currentSiblingIndex + 1} / ${siblingFiles.length}`
      : siblingLoading
      ? "読み込み中"
      : "同階層";
  const rotateLeft = () => {
    setRotation((currentRotation) => (currentRotation + 270) % 360);
  };
  const rotateRight = () => {
    setRotation((currentRotation) => (currentRotation + 90) % 360);
  };
  const updateRedSheetWidth = (width: number) => {
    setRedSheetSize((currentSize) => ({ ...currentSize, width }));
  };
  const updateRedSheetHeight = (height: number) => {
    setRedSheetSize((currentSize) => ({ ...currentSize, height }));
  };

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
        setFile(null);
        setRotation(0);
        setRedSheetEnabled(false);
        setRedSheetSize(INITIAL_RED_SHEET_SIZE);

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

  useEffect(() => {
    let ignore = false;

    async function loadSiblingFiles() {
      if (!path) {
        setSiblingFiles([]);
        setSiblingLoading(false);
        return;
      }

      try {
        setSiblingLoading(true);

        const response = await fetch(
          `/api/github/contents?path=${encodeURIComponent(parentPath)}`,
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

        const viewableFiles = "items" in data
          ? data.items
              .filter((item) => {
                return item.type === "file" && getViewableFileType(item.name);
              })
              .sort((a, b) => a.name.localeCompare(b.name, "ja"))
          : [];

        if (!ignore) {
          setSiblingFiles(viewableFiles);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setSiblingFiles([]);
        }
      } finally {
        if (!ignore) {
          setSiblingLoading(false);
        }
      }
    }

    loadSiblingFiles();

    return () => {
      ignore = true;
    };
  }, [parentPath, path]);

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

            <button
              type="button"
              onClick={rotateLeft}
              aria-label="左に90度回転"
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <FiRotateCcw className="h-5 w-5" aria-hidden="true" />
              左回転
            </button>

            <button
              type="button"
              onClick={rotateRight}
              aria-label="右に90度回転"
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <FiRotateCw className="h-5 w-5" aria-hidden="true" />
              右回転
            </button>

            {fileType?.kind === "pdf" ? (
              <button
                type="button"
                onClick={() => setRedSheetEnabled((enabled) => !enabled)}
                aria-pressed={redSheetEnabled}
                aria-label={
                  redSheetEnabled ? "赤シートを解除" : "赤シートを有効化"
                }
                className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
                  redSheetEnabled
                    ? "border-red-300 bg-red-600 text-white shadow-sm hover:bg-red-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                赤シート
              </button>
            ) : null}

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
          {rotation ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {rotation}度回転
            </span>
          ) : null}
        </div>

        {fileType?.kind === "pdf" && redSheetEnabled ? (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold text-slate-600">
              <span className="flex items-center justify-between gap-3">
                <span>赤シート横幅</span>
                <span className="tabular-nums text-slate-500">
                  {redSheetSize.width}px
                </span>
              </span>
              <input
                type="range"
                min="120"
                max="1000"
                step="20"
                value={redSheetSize.width}
                onChange={(event) =>
                  updateRedSheetWidth(Number(event.currentTarget.value))
                }
                className="h-2 w-full cursor-pointer accent-red-600"
                aria-label="赤シートの横幅"
              />
            </label>

            <label className="grid gap-2 text-xs font-bold text-slate-600">
              <span className="flex items-center justify-between gap-3">
                <span>赤シート縦幅</span>
                <span className="tabular-nums text-slate-500">
                  {redSheetSize.height}px
                </span>
              </span>
              <input
                type="range"
                min="80"
                max="500"
                step="10"
                value={redSheetSize.height}
                onChange={(event) =>
                  updateRedSheetHeight(Number(event.currentTarget.value))
                }
                className="h-2 w-full cursor-pointer accent-red-600"
                aria-label="赤シートの縦幅"
              />
            </label>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <SiblingNavControl
            direction="previous"
            file={previousFile}
            loading={siblingLoading}
          />

          <div className="flex shrink-0 items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {siblingPosition}
          </div>

          <SiblingNavControl
            direction="next"
            file={nextFile}
            loading={siblingLoading}
          />
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
              className="max-h-full max-w-full rounded-lg bg-white object-contain shadow-sm transition-transform"
              style={{ transform: `rotate(${rotation}deg)` }}
              onLoad={() => setFrameLoading(false)}
              onError={() => {
                setFrameLoading(false);
                setError("画像プレビューを読み込めませんでした。");
              }}
            />
          </div>
        ) : fileType?.kind === "pdf" ? (
          <PdfDocumentViewer
            redSheetEnabled={redSheetEnabled}
            redSheetSize={redSheetSize}
            rotation={rotation}
            src={rawFileUrl}
            title={file?.name || fileName}
          />
        ) : (
          <div className="flex min-h-[520px] items-center justify-center bg-slate-100 p-6 text-sm font-medium text-slate-500">
            このファイルはプレビューできません。
          </div>
        )}
      </div>
    </div>
  );
}
