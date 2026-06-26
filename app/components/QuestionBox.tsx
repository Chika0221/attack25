import React from "react";

interface QuestionBoxProps {
  questionText: string;
  answerText: string;
  showAnswer: boolean;
}

export function QuestionBox({ questionText, answerText, showAnswer }: QuestionBoxProps) {
  if (!questionText) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700 p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-400 mb-2">問題</h2>
        <p className="text-3xl font-bold whitespace-pre-wrap">{questionText}</p>
      </div>

      {showAnswer && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h2 className="text-xl font-bold text-green-400 mb-2">解答</h2>
          <p className="text-4xl font-extrabold text-green-300 whitespace-pre-wrap">{answerText}</p>
        </div>
      )}
    </div>
  );
}
