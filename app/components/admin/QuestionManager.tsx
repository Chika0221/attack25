import React, { useState, useEffect } from "react";
import { socket } from "../../lib/socketClient";

interface QuestionManagerProps {
  currentQuestionText: string;
  currentAnswerText: string;
  currentShowAnswer: boolean;
}

interface QuestionItem {
  question: string;
  answer: string;
}

export function QuestionManager({ currentQuestionText, currentAnswerText, currentShowAnswer }: QuestionManagerProps) {
  const [questionInput, setQuestionInput] = useState(currentQuestionText);
  const [answerInput, setAnswerInput] = useState(currentAnswerText);
  const [questionList, setQuestionList] = useState<QuestionItem[]>([]);

  // 初期ロード時にローカルストレージから問題を読み込む
  useEffect(() => {
    const saved = localStorage.getItem("attack25_questions");
    if (saved) {
      try {
        setQuestionList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved questions");
      }
    }
  }, []);

  // 外部からの状態変更（初期ロードや他クライアントからのリセット）に同期
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuestionInput((prev) => currentQuestionText !== prev ? currentQuestionText : prev);
      setAnswerInput((prev) => currentAnswerText !== prev ? currentAnswerText : prev);
    }, 0);
    return () => clearTimeout(timeout);
  }, [currentQuestionText, currentAnswerText]);

  const saveToLocal = (list: QuestionItem[]) => {
    setQuestionList(list);
    localStorage.setItem("attack25_questions", JSON.stringify(list));
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const formattedList = json.map((item: any) => ({
            question: item.question || item.q || "",
            answer: item.answer || item.a || "",
          }));
          // 既存のリストに追加する
          saveToLocal([...questionList, ...formattedList]);
        } else {
          alert("JSONは配列形式である必要があります。\n例: [ { \"question\": \"問題\", \"answer\": \"答え\" } ]");
        }
      } catch (err) {
        alert("JSONの読み込みに失敗しました。正しいフォーマットか確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // 同じファイルを再度選択できるようにリセット
  };

  const handleSelectFromList = (item: QuestionItem) => {
    setQuestionInput(item.question);
    setAnswerInput(item.answer);
  };

  const handleDeleteItem = (index: number) => {
    const newList = [...questionList];
    newList.splice(index, 1);
    saveToLocal(newList);
  };

  const handleClearList = () => {
    if (confirm("問題リストをすべて削除しますか？")) {
      saveToLocal([]);
    }
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

      <div className="flex gap-2 mb-6">
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

      <hr className="my-6 border-slate-200" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">問題リスト</h3>
        <div className="flex gap-2">
          <label className="cursor-pointer px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700">
            JSONをインポート
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {questionList.length > 0 && (
            <button
              onClick={handleClearList}
              className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded hover:bg-red-600"
            >
              リストクリア
            </button>
          )}
        </div>
      </div>

      {questionList.length > 0 ? (
        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-200">
          {questionList.map((item, index) => (
            <div key={index} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-4">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleSelectFromList(item)}
              >
                <div className="text-sm font-bold text-slate-800 line-clamp-2">Q: {item.question}</div>
                <div className="text-sm text-slate-500 truncate mt-1">A: {item.answer}</div>
              </div>
              <button
                onClick={() => handleDeleteItem(index)}
                className="text-red-500 hover:text-red-700 p-1"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-slate-50 rounded text-slate-500 text-sm">
          問題がありません。<br/>
          JSONファイルからインポートしてください。<br/>
          <span className="text-xs mt-2 block opacity-70">
            ※形式: [ &#123; "question": "問題文", "answer": "答え" &#125; ]
          </span>
        </div>
      )}

      <div className="mt-6 p-4 bg-slate-50 rounded text-sm text-slate-600">
        <p><strong>現在の状態:</strong></p>
        <p>問題表示: {currentQuestionText ? "あり" : "なし"}</p>
        <p>解答表示: {currentShowAnswer ? "あり" : "なし"}</p>
      </div>
    </div>
  );
}
