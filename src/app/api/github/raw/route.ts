import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRepositoryRawFile, GitHubApiError } from "@/lib/github";
import { getViewableFileType, supportedFileLabels } from "@/lib/viewable-files";

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

    const fileType = getViewableFileType(path);

    if (!fileType) {
      return NextResponse.json(
        {
          message: `対応していないファイル形式です。対応形式: ${supportedFileLabels.join(
            " / "
          )}`,
        },
        { status: 400 }
      );
    }

    const { buffer } = await getRepositoryRawFile(path);
    const fileName = path.split("/").pop() || `exam.${fileType.extension}`;
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": fileType.mimeType,
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
      { message: "ファイルの取得中にエラーが発生しました。" },
      { status: 500 }
    );
  }
});
