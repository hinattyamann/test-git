import { signIn } from "@/auth";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

function getErrorMessage(error?: string) {
  if (error === "AccessDenied") {
    return "学校指定のメールアドレスのみログインできます。";
  }

  if (error) {
    return "ログインに失敗しました。もう一度お試しください。";
  }

  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          test<span className="text-blue-600">.git</span>
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          学校Googleアカウントでログインしてください。
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Googleでログイン
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          許可された学校メールアドレス以外ではログインできません。
        </p>
      </div>
    </main>
  );
}