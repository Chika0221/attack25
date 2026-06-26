import React from "react";

const COLORS = [
  "bg-slate-800 text-slate-400 font-bold", // 0: 空（暗いグレー）
  "bg-red-500 text-white font-bold",       // 1: 赤
  "bg-green-500 text-white font-bold",     // 2: 緑
  "bg-white text-black font-bold border-4 border-slate-300", // 3: 白
  "bg-blue-500 text-white font-bold",      // 4: 青
];

interface BoardProps {
  board: number[];
}

export function Board({ board }: BoardProps) {
  return (
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
  );
}
