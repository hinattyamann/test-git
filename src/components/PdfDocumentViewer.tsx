"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";

type PdfDocumentViewerProps = {
  src: string;
  title: string;
  rotation: number;
  redSheetEnabled: boolean;
  redSheetSize: {
    width: number;
    height: number;
  };
};

type PdfJsModule = typeof import("pdfjs-dist");

function useElementWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function updateWidth() {
      setWidth(ref.current?.clientWidth || 0);
    }

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, width };
}

function PdfPageCanvas({
  document,
  pageNumber,
  rotation,
  width,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
  rotation: number;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function loadPage() {
      setRendering(true);
      const nextPage = await document.getPage(pageNumber);

      if (!canceled) {
        setPage(nextPage);
      }
    }

    loadPage().catch(() => {
      if (!canceled) {
        setRendering(false);
      }
    });

    return () => {
      canceled = true;
      setPage(null);
    };
  }, [document, pageNumber]);

  useEffect(() => {
    if (!page || !canvasRef.current || width <= 0) return;

    let renderTask: RenderTask | null = null;
    let canceled = false;
    const currentPage = page;

    async function renderPage() {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      setRendering(true);

      const baseViewport = currentPage.getViewport({ scale: 1, rotation });
      const pageWidth = Math.max(280, width - 24);
      const scale = pageWidth / baseViewport.width;
      const viewport = currentPage.getViewport({ scale, rotation });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      renderTask = currentPage.render({
        canvas,
        canvasContext: context,
        viewport,
        transform:
          outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      });

      await renderTask.promise;

      if (!canceled) {
        setRendering(false);
      }
    }

    renderPage().catch((error: unknown) => {
      if (!canceled && error instanceof Error && error.name !== "RenderingCancelledException") {
        setRendering(false);
      }
    });

    return () => {
      canceled = true;
      renderTask?.cancel();
      currentPage.cleanup();
    };
  }, [page, rotation, width]);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold text-slate-500">
        <span>{pageNumber}ページ</span>
        {rendering && <span>描画中</span>}
      </div>
      <div className="overflow-x-auto rounded-xl bg-slate-200 p-2 shadow-sm ring-1 ring-slate-200">
        <canvas
          ref={canvasRef}
          aria-label={`${pageNumber}ページ目`}
          className="mx-auto block max-w-none rounded-lg bg-white"
        />
      </div>
    </section>
  );
}

export default function PdfDocumentViewer({
  redSheetEnabled,
  redSheetSize,
  rotation,
  src,
  title,
}: PdfDocumentViewerProps) {
  const { ref, width } = useElementWidth();
  const redSheetRef = useRef<HTMLDivElement | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redSheetVisible, setRedSheetVisible] = useState(false);

  function moveRedSheet(event: PointerEvent<HTMLDivElement>) {
    if (!redSheetEnabled || !redSheetRef.current) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    redSheetRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }

  function showRedSheet(event: PointerEvent<HTMLDivElement>) {
    if (!redSheetEnabled) return;

    moveRedSheet(event);
    setRedSheetVisible(true);
  }

  useEffect(() => {
    let canceled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    let loadedDocument: PDFDocumentProxy | null = null;

    async function loadPdf() {
      setLoading(true);
      setError("");
      setPdfDocument(null);

      const pdfjs: PdfJsModule = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const response = await fetch(src, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("PDFファイルを取得できませんでした。");
      }

      const data = await response.arrayBuffer();
      loadingTask = pdfjs.getDocument({
        data,
        cMapPacked: true,
        cMapUrl: "/pdfjs/cmaps/",
        standardFontDataUrl: "/pdfjs/standard_fonts/",
      });
      loadedDocument = await loadingTask.promise;

      if (!canceled) {
        setPdfDocument(loadedDocument);
      }
    }

    loadPdf()
      .catch((loadError: unknown) => {
        console.error(loadError);

        if (!canceled) {
          setError("PDFプレビューを読み込めませんでした。");
        }
      })
      .finally(() => {
        if (!canceled) {
          setLoading(false);
        }
      });

    return () => {
      canceled = true;
      loadingTask?.destroy();
      loadedDocument?.destroy();
    };
  }, [src]);

  return (
    <div
      ref={ref}
      className="relative min-h-[70vh] overflow-hidden bg-slate-100 px-2 py-4 sm:px-4"
      onPointerEnter={showRedSheet}
      onPointerLeave={() => setRedSheetVisible(false)}
      onPointerMove={moveRedSheet}
    >
      {loading && (
        <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-slate-500">
          PDFプレビューを読み込み中です...
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {pdfDocument && !error && (
        <div className="space-y-5" aria-label={title}>
          {Array.from({ length: pdfDocument.numPages }, (_, index) => (
            <PdfPageCanvas
              key={index + 1}
              document={pdfDocument}
              pageNumber={index + 1}
              rotation={rotation}
              width={width}
            />
          ))}
        </div>
      )}

      <div
        ref={redSheetRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 rounded-2xl border border-red-700/20 bg-[#FB000B]/90 shadow-[0_18px_45px_rgba(127,29,29,0.18)] ring-1 ring-white/20 transition-opacity duration-100 ${
          redSheetEnabled && redSheetVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: `${redSheetSize.height}px`,
          mixBlendMode: "multiply",
          willChange: "transform, opacity",
          width: `${redSheetSize.width}px`,
        }}
      />
    </div>
  );
}
