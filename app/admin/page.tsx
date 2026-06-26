"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socketClient";
import { getFlippablePanels } from "../lib/gameLogic";

const COLOR_NAMES = ["空", "赤", "緑", "白", "青"];
const COLOR_CLASSES = [
  "bg-slate-700 text-slate-500", // 0
  "bg-red-500 text-white",       // 1
  "bg-green-500 text-white",     // 2
  "bg-white text-black border",  // 3
  "bg-blue-500 text-white"       // 4
];

import { BuzzerManager } from "../components/admin/BuzzerManager";
import { AdminPanelBoard } from "../components/admin/AdminPanelBoard";
import { QuestionManager } from "../components/admin/QuestionManager";

export default function AdminPage() {
  const [board, setBoard] = useState<number[]>(Array(25).fill(0));
  const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  // 現在操作中の色
  const [activeColor, setActiveColor] = useState<number>(1);
  // 強制上書きモード（オセロロジックを無視してそのマスだけ変える）
  const [forceMode, setForceMode] = useState<boolean>(false);
  // アニメーション実行中フラグ
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    socket.connect();
    socket.on("gameState", (state: any) => {
      setBoard(state.board);
      setBuzzedPlayer(state.buzzedPlayer);
      setQuestionText(state.questionText || "");
      setAnswerText(state.answerText || "");
      setShowAnswer(state.showAnswer || false);
    });
    return () => {
      socket.off("gameState");
      socket.disconnect();
    };
  }, []);

  const handlePanelClick = (index: number) => {
    if (isAnimating) return;

    let newBoard = [...board];

    if (forceMode) {
      // 強制上書きモード
      newBoard[index] = activeColor;
      socket.emit("updateBoard", newBoard);
    } else {
      // 通常モード（オセロロジック）
      if (board[index] !== 0) {
        alert("既にパネルが置かれています");
        return;
      }
      const flippable = getFlippablePanels(board, index, activeColor);
      
      // クリックしたマスを塗る
      newBoard[index] = activeColor;
      socket.emit("updateBoard", [...newBoard]);

      if (flippable.length > 0) {
        setIsAnimating(true);
        let i = 0;
        const interval = setInterval(() => {
          if (i < flippable.length) {
            newBoard[flippable[i]] = activeColor;
            socket.emit("updateBoard", [...newBoard]);
            i++;
          } else {
            clearInterval(interval);
            setIsAnimating(false);
          }
        }, 600); // 0.6秒ごとに1枚ずつひっくり返す
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">司会者コントロールパネル</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <BuzzerManager
            buzzedPlayer={buzzedPlayer}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            forceMode={forceMode}
            setForceMode={setForceMode}
          />
          <QuestionManager
            currentQuestionText={questionText}
            currentAnswerText={answerText}
            currentShowAnswer={showAnswer}
          />
        </div>
        
        <AdminPanelBoard 
          board={board}
          activeColor={activeColor}
          handlePanelClick={handlePanelClick}
        />
      </div>
    </div>
  );
}

