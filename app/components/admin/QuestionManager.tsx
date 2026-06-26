import React, { useState, useEffect } from "react";
import { socket } from "../../lib/socketClient";

interface QuestionManagerProps {
  currentQuestionText: string;
  currentAnswerText: string;
  currentShowAnswer: boolean;
}

export function QuestionManager({ currentQuestionText, currentAnswerText, currentShowAnswer }: QuestionManagerProps) {
  const [questionInput, setQuestionInput] = useState(currentQuestionText);
  const [answerInput, setAnswerInput] = useState(currentAnswerText);

  // Sync inputs if external state changes (e.g. initial load or reset from another client)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuestionInput((prev) => currentQuestionText !== prev ? currentQuestionText : prev);
      setAnswerInput((prev) => currentAnswerText !== prev ? currentAnswerText : prev);
    }, 0);
    return () => clearTimeout(timeout);
  }, [currentQuestionText, currentAnswerText]);

  const handleShowQuestion = () => {
    socket.emit("updateQuestion", {
      questionText: questionInput,
      answerText: answerInput,
      showAnswer: false,
    });
  };

  const handleShowAnswer = () => {
    socket.emit("updateQuestion", {
      showAnswer: true,
    });
  };

  const handleClear = () => {
    setQuestionInput("");
    setAnswerInput("");
    socket.emit("updateQuestion", {
      questionText: "",
      answerText: "",
      showAnswer: false,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mt-8">
      <h2 className="text-xl font-bold mb-4">問題・解答管理</h2>

      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-1">問題文</label>
        <textarea
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          className="w-full border border-slate-300 rounded p-2"
          rows={3}
          placeholder="問題をここに入力してください..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-1">解答</label>
        <input
          type="text"
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          className="w-full border border-slate-300 rounded p-2"
          placeholder="解答をここに入力してください..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleShowQuestion}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex-1"
        >
          問題を表示
        </button>
        <button
          onClick={handleShowAnswer}
          className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 flex-1"
        >
          解答を表示
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-slate-400 text-white font-bold rounded hover:bg-slate-500"
        >
          クリア
        </button>
      </div>

      <div className="mt-4 p-4 bg-slate-50 rounded text-sm text-slate-600">
        <p><strong>現在の状態:</strong></p>
        <p>問題表示: {currentQuestionText ? "あり" : "なし"}</p>
        <p>解答表示: {currentShowAnswer ? "あり" : "なし"}</p>
      </div>
    </div>
  );
}
