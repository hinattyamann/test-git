export type GitHubContentType = "file" | "dir" | "symlink" | "submodule";

export type GitHubContentItem = {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string | null;
  git_url: string | null;
  download_url: string | null;
  type: GitHubContentType;
};

export type GitHubContentsApiResponse = {
  items: GitHubContentItem[];
};

export type ApiErrorResponse = {
  message: string;
};