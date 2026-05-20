import type { GitHubContentItem } from "@/types/github";

/**
 * 注意:
 * このファイルはサーバー側専用。
 * Client Component から直接 import しないこと。
 *
 * GitHub private repository のトークンを扱うため、
 * "use client" を付けたファイルから呼び出してはいけない。
 */

export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

function getEnv() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo) {
    throw new GitHubApiError(
      "GitHub の owner または repo が設定されていません。",
      500
    );
  }

  return { owner, repo, branch };
}

function normalizePath(path: string) {
  const cleanPath = path.trim().replace(/^\/+/, "").replace(/\/+$/, "");

  // 念のため不正なパスを防ぐ
  if (cleanPath.split("/").some((segment) => segment === "..")) {
    throw new GitHubApiError("不正なパスです。", 400);
  }

  return cleanPath;
}

function buildGitHubContentsUrl(path: string) {
  const { owner, repo, branch } = getEnv();
  const cleanPath = normalizePath(path);

  const encodedPath = cleanPath
    ? cleanPath.split("/").map(encodeURIComponent).join("/")
    : "";

  const baseUrl = `https://api.github.com/repos/${encodeURIComponent(
    owner
  )}/${encodeURIComponent(repo)}/contents`;

  const url = new URL(encodedPath ? `${baseUrl}/${encodedPath}` : baseUrl);
  url.searchParams.set("ref", branch);

  return url;
}

function buildHeaders(accept: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: accept,
    "User-Agent": "test.git",
  };

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function normalizeItem(item: GitHubContentItem): GitHubContentItem {
  return {
    name: item.name,
    path: item.path,
    sha: item.sha,
    size: item.size,
    url: item.url,
    html_url: item.html_url,
    git_url: item.git_url,
    download_url: item.download_url,
    type: item.type,
  };
}

/**
 * 指定したパスのディレクトリ、またはファイル情報を取得する。
 */
export async function getRepositoryContents(
  path: string = ""
): Promise<GitHubContentItem[]> {
  const url = buildGitHubContentsUrl(path);

  const response = await fetch(url, {
    headers: buildHeaders("application/vnd.github+json"),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new GitHubApiError(
      `GitHub API の取得に失敗しました: ${message}`,
      response.status
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data.map(normalizeItem);
  }

  return [normalizeItem(data)];
}

/**
 * PDFなどのファイル本体を取得する。
 * private repository の場合でも、サーバー側で GITHUB_TOKEN を使える。
 */
export async function getRepositoryRawFile(path: string) {
  const url = buildGitHubContentsUrl(path);

  const response = await fetch(url, {
    headers: buildHeaders("application/vnd.github.raw"),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new GitHubApiError(
      `GitHub raw file の取得に失敗しました: ${message}`,
      response.status
    );
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "application/pdf";

  return {
    buffer,
    contentType,
  };
}