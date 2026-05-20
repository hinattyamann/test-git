import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositoryContents, GitHubApiError } from "@/lib/github";

export const dynamic = "force-dynamic";

export const GET = auth(async function GET(request: NextAuthRequest) {
  try {
    if (!request.auth) {
      return NextResponse.json(
        { message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";

    const items = await getRepositoryContents(path);

    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);

    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "ファイル一覧の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
});
