"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import type { EnglishWord } from "@/lib/english-words";

type EnglishLearningToolProps = {
  initialWords: EnglishWord[];
};

type QuizResult = "correct" | "wrong" | null;

function getMeanings(word: EnglishWord) {
  return [word.meaning1, word.meaning2, word.meaning3].filter(Boolean);
}

function shuffleWords(words: EnglishWord[]) {
  return words
    .map((word) => ({ word, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ word }) => word);
}

export default function EnglishLearningTool({
  initialWords,
}: EnglishLearningToolProps) {
  const [quizWords, setQuizWords] = useState<EnglishWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [quizResult, setQuizResult] = useState<QuizResult>(null);
  const [wrongWords, setWrongWords] = useState<EnglishWord[]>([]);
  const [finished, setFinished] = useState(false);

  const currentWord = quizWords[currentIndex];
  const currentMeanings = currentWord ? getMeanings(currentWord) : [];
  const isStarted = quizWords.length > 0;
  const correctCount = Math.max(quizWords.length - wrongWords.length, 0);
  const accuracy = quizWords.length
    ? Math.round((correctCount / quizWords.length) * 100)
    : 0;

  function startQuiz(sourceWords = initialWords) {
    if (sourceWords.length === 0) return;

    setQuizWords(shuffleWords(sourceWords));
    setCurrentIndex(0);
    setAnswer("");
    setQuizResult(null);
    setWrongWords([]);
    setFinished(false);
  }

  function checkAnswer() {
    if (!currentWord || quizResult) return;

    const normalizedAnswer = answer.trim();
    const isCorrect = currentMeanings.includes(normalizedAnswer);

    setQuizResult(isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      setWrongWords((currentWrongWords) => [...currentWrongWords, currentWord]);
    }
  }

  function nextWord() {
    if (!currentWord) return;

    if (currentIndex + 1 >= quizWords.length) {
      setFinished(true);
      setQuizResult(null);
      setAnswer("");
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswer("");
    setQuizResult(null);
  }

  function handleQuizSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (finished) return;

    if (quizResult) {
      nextWord();
      return;
    }

    checkAnswer();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold text-blue-700">English Words</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              英単語学習
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              登録済みの英単語からランダムに出題します。
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {initialWords.length} words
          </span>
        </div>
      </div>

      {!isStarted && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <FiBookOpen size={22} aria-hidden />
              </span>
              <h2 className="mt-5 text-lg font-black text-slate-950">
                英単語学習をはじめる
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                英単語の意味を入力し、間違えた単語だけ再挑戦できます。
              </p>
            </div>

            <button
              type="button"
              onClick={() => startQuiz()}
              disabled={initialWords.length === 0}
              className="focus-ring inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <FiBookOpen aria-hidden />
              学習開始
            </button>
          </div>
        </section>
      )}

      {isStarted && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!finished && currentWord && (
            <>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold text-blue-700">Quiz</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {currentIndex + 1}問目: {currentWord.spell}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {currentIndex + 1} / {quizWords.length}
                </span>
              </div>

              <form onSubmit={handleQuizSubmit} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    この単語の意味
                  </span>
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    autoFocus
                  />
                </label>

                {quizResult && (
                  <div
                    className={`rounded-2xl p-4 text-sm font-bold ${
                      quizResult === "correct"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                        : "bg-red-50 text-red-700 ring-1 ring-red-200"
                    }`}
                  >
                    {quizResult === "correct" ? (
                      "正解"
                    ) : (
                      <span>
                        不正解。答え: {currentMeanings.join(" / ")}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-fit"
                >
                  {quizResult ? (
                    <>
                      次へ
                      <FiChevronRight aria-hidden />
                    </>
                  ) : (
                    <>
                      <FiCheck aria-hidden />
                      答える
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {finished && (
            <div>
              <p className="text-xs font-bold text-blue-700">Result</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                完走しました
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold text-slate-500">問題数</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {quizWords.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold text-slate-500">
                    間違えた数
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {wrongWords.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold text-slate-500">正答率</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {accuracy}%
                  </p>
                </div>
              </div>

              {wrongWords.length > 0 ? (
                <div className="mt-6">
                  <p className="mb-3 text-sm font-bold text-slate-700">
                    間違えた単語
                  </p>
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                    {wrongWords.map((word, index) => (
                      <div
                        key={`${word.spell}-${index}`}
                        className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-bold text-slate-950">
                          {word.spell}
                        </span>
                        <span className="text-sm text-slate-500">
                          {getMeanings(word).join(" / ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700 ring-1 ring-green-200">
                  間違いなしです。
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {wrongWords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => startQuiz(wrongWords)}
                    className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <FiRefreshCw aria-hidden />
                    間違えた単語で再挑戦
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => startQuiz()}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <FiBookOpen aria-hidden />
                  全単語で再挑戦
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
