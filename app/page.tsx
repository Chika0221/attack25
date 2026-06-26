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

export default function BoardPage() {
  const [board, setBoard] = useState<number[]>(Array(25).fill(0));
  const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null);
  const [buzzedColor, setBuzzedColor] = useState<number | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on("gameState", (state: any) => {
      setBoard(state.board);
      setBuzzedPlayer(state.buzzedPlayer);
      if (state.buzzedPlayer && state.players) {
        const player = state.players.find((p: any) => p.name === state.buzzedPlayer);
        setBuzzedColor(player ? player.color : null);
      } else {
        setBuzzedColor(null);
      }
    });

    return () => {
      socket.off("gameState");
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
        
        {/* ヘッダー部分（タイトルと早押し表示を横並びにするとスペース効率が良い） */}
        <div className="w-full flex items-center justify-between h-24 mb-4">
          <h1 className="text-5xl font-extrabold text-white tracking-widest ml-4">ATTACK 25</h1>
          
          <div className={`flex-1 flex items-center justify-center h-full ml-12 rounded-xl border shadow-xl transition-colors duration-300 ${
            buzzedColor === 1 ? "bg-red-500 border-red-400" :
            buzzedColor === 2 ? "bg-green-500 border-green-400" :
            buzzedColor === 3 ? "bg-white border-slate-300" :
            buzzedColor === 4 ? "bg-blue-500 border-blue-400" :
            "bg-slate-800 border-slate-700"
          }`}>
            {buzzedPlayer ? (
              <div className={`text-4xl font-black animate-pulse ${buzzedColor === 3 ? "text-black" : "text-white"}`}>
                🚨 {buzzedPlayer} が解答中！ 🚨
              </div>
            ) : (
              <div className="text-2xl font-bold text-slate-500">
                問題読み上げ待機中...
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ（盤面とスコア） */}
        <div className="flex flex-row gap-8 w-full flex-1 items-stretch justify-center pb-4">
          
          {/* 5x5 パネル（左側・画面の高さいっぱいに広がるように） */}
          <div className="grid grid-cols-5 gap-3 h-full aspect-square p-4 bg-slate-700 rounded-xl shadow-2xl border border-slate-600">
            {board.map((colorIndex, i) => (
              <div
                key={i}
                className={`flex items-center justify-center text-4xl sm:text-6xl rounded-lg shadow-inner transition-all duration-300 transform ${COLORS[colorIndex]}`}
                style={{ textShadow: colorIndex === 3 ? "none" : "2px 2px 4px rgba(0,0,0,0.5)" }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* スコアボード（右側） */}
          <div className="flex flex-col gap-6 w-80 lg:w-96 justify-between h-full py-4">
            <div className="flex-1 flex flex-row items-center justify-between px-8 bg-slate-800 rounded-2xl border-r-8 border-r-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <span className="text-red-500 font-bold text-3xl tracking-widest">RED</span>
              <span className="text-6xl lg:text-7xl font-black text-white">{counts.red}</span>
            </div>
            <div className="flex-1 flex flex-row items-center justify-between px-8 bg-slate-800 rounded-2xl border-r-8 border-r-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <span className="text-green-500 font-bold text-3xl tracking-widest">GREEN</span>
              <span className="text-6xl lg:text-7xl font-black text-white">{counts.green}</span>
            </div>
            <div className="flex-1 flex flex-row items-center justify-between px-8 bg-slate-800 rounded-2xl border-r-8 border-r-white shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <span className="text-white font-bold text-3xl tracking-widest">WHITE</span>
              <span className="text-6xl lg:text-7xl font-black text-white">{counts.white}</span>
            </div>
            <div className="flex-1 flex flex-row items-center justify-between px-8 bg-slate-800 rounded-2xl border-r-8 border-r-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="text-blue-500 font-bold text-3xl tracking-widest">BLUE</span>
              <span className="text-6xl lg:text-7xl font-black text-white">{counts.blue}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
