import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositoryRawFile, GitHubApiError } from "@/lib/github";

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
    const download = searchParams.get("download") === "1";

    if (!path) {
      return NextResponse.json(
        { message: "path が指定されていません。" },
        { status: 400 }
      );
    }

    if (!path.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { message: "PDF ファイルのみ閲覧できます。" },
        { status: 400 }
      );
    }

    const { buffer } = await getRepositoryRawFile(path);
    const fileName = path.split("/").pop() || "exam.pdf";
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${
          download ? "attachment" : "inline"
        }; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(error);

    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "PDF の取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
});
