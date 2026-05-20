export type ViewableFileKind = "pdf" | "image";

export type ViewableFileType = {
  extension: string;
  kind: ViewableFileKind;
  label: string;
  mimeType: string;
};

const VIEWABLE_FILE_TYPES: Record<string, ViewableFileType> = {
  pdf: {
    extension: "pdf",
    kind: "pdf",
    label: "PDF",
    mimeType: "application/pdf",
  },
  png: {
    extension: "png",
    kind: "image",
    label: "PNG",
    mimeType: "image/png",
  },
  jpg: {
    extension: "jpg",
    kind: "image",
    label: "JPEG",
    mimeType: "image/jpeg",
  },
  jpeg: {
    extension: "jpeg",
    kind: "image",
    label: "JPEG",
    mimeType: "image/jpeg",
  },
  webp: {
    extension: "webp",
    kind: "image",
    label: "WebP",
    mimeType: "image/webp",
  },
  gif: {
    extension: "gif",
    kind: "image",
    label: "GIF",
    mimeType: "image/gif",
  },
  avif: {
    extension: "avif",
    kind: "image",
    label: "AVIF",
    mimeType: "image/avif",
  },
  bmp: {
    extension: "bmp",
    kind: "image",
    label: "BMP",
    mimeType: "image/bmp",
  },
};

type FileLike = {
  name: string;
  type: string;
};

export const supportedFileLabels = Array.from(
  new Set(Object.values(VIEWABLE_FILE_TYPES).map((type) => type.label))
);

export function getFileExtension(pathOrName: string) {
  const fileName = pathOrName.split("/").pop() || "";
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex < 0 || dotIndex === fileName.length - 1) return "";

  return fileName.slice(dotIndex + 1).toLowerCase();
}

export function getViewableFileType(pathOrName: string) {
  const extension = getFileExtension(pathOrName);

  return VIEWABLE_FILE_TYPES[extension] || null;
}

export function isViewableFile(item: FileLike) {
  return item.type === "file" && getViewableFileType(item.name) !== null;
}

export function getViewableFileLabel(pathOrName: string) {
  return getViewableFileType(pathOrName)?.label || "FILE";
}
