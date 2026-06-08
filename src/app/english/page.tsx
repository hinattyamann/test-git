import Header from "@/components/Header";
import EnglishLearningTool from "@/components/EnglishLearningTool";
import type { EnglishWord } from "@/lib/english-words";
import { readEnglishWords } from "@/lib/english-words";

export const dynamic = "force-dynamic";

export default async function EnglishPage() {
  let words: EnglishWord[] = [];
  let errorMessage = "";

  try {
    words = await readEnglishWords();
  } catch (error) {
    console.error(error);
    errorMessage = "英単語データを読み込めませんでした。";
  }

  return (
    <main className="app-shell min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : (
          <EnglishLearningTool initialWords={words} />
        )}
      </section>
    </main>
  );
}
