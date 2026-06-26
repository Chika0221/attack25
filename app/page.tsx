"use client";

import { useEffect, useState } from "react";
import { socket } from "./lib/socketClient";

const COLORS = [
  "bg-slate-800 text-slate-400 font-bold", // 0: 空（暗いグレー）
  "bg-red-500 text-white font-bold",       // 1: 赤
  "bg-green-500 text-white font-bold",     // 2: 緑
  "bg-white text-black font-bold border-4 border-slate-300", // 3: 白
  "bg-blue-500 text-white font-bold",      // 4: 青
];

import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { ScoreBoard } from "./components/ScoreBoard";
import { QuestionBox } from "./components/QuestionBox";

export default function BoardPage() {
  const [board, setBoard] = useState<number[]>(Array(25).fill(0));
  const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null);
  const [buzzedColor, setBuzzedColor] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  useEffect(() => {
    socket.connect();

    socket.on("gameState", (state: any) => {
      setBoard(state.board);
      setQuestionText(state.questionText || "");
      setAnswerText(state.answerText || "");
      setShowAnswer(state.showAnswer || false);
      setBuzzedPlayer((prevBuzzedPlayer) => {
        // 新たに早押しされた場合のみ音を鳴らす
        if (state.buzzedPlayer && !prevBuzzedPlayer) {
          const player = state.players.find((p: any) => p.name === state.buzzedPlayer);
          if (player) {
            const colorNames = ["", "red", "green", "white", "blue"];
            const colorName = colorNames[player.color];
            if (colorName) {
              const audio = new Audio(`/audios/${colorName}.wav`);
              audio.play().catch((e) => console.log("Audio play failed:", e));
            }
          }
        }
        return state.buzzedPlayer;
      });
      if (state.buzzedPlayer && state.players) {
        const player = state.players.find((p: any) => p.name === state.buzzedPlayer);
        setBuzzedColor(player ? player.color : null);
      } else {
        setBuzzedColor(null);
      }
    });

    socket.on("wrongAnswer", () => {
      // フォルダには but.mp3 があるためそちらを鳴らします
      const audio = new Audio(`/audios/but.mp3`);
      audio.play().catch((e) => console.log("Audio play failed:", e));
    });

    return () => {
      socket.off("gameState");
      socket.off("wrongAnswer");
      socket.disconnect();
    };
  }, []);


  // 各色の枚数を計算
  const counts = {
    red: board.filter(c => c === 1).length,
    green: board.filter(c => c === 2).length,
    white: board.filter(c => c === 3).length,
    blue: board.filter(c => c === 4).length,
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* 16:9 のスクリーンコンテナ */}
      <div 
        className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-between p-6 sm:p-10 shadow-2xl relative"
        style={{ maxHeight: "100vh", maxWidth: "177.77vh" }}
      >
        <Header buzzedPlayer={buzzedPlayer} buzzedColor={buzzedColor} />

        {questionText && (
          <QuestionBox
            questionText={questionText}
            answerText={answerText}
            showAnswer={showAnswer}
          />
        )}

        {/* メインコンテンツ（盤面とスコア） */}
        <div className="flex flex-row gap-8 w-full flex-1 items-stretch justify-center pb-4">
          <Board board={board} />
          <ScoreBoard counts={counts} />
        </div>
      </div>
    </div>
  );
}
