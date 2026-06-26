import React from "react";

interface HeaderProps {
  buzzedPlayer: string | null;
  buzzedColor: number | null;
}

export function Header({ buzzedPlayer, buzzedColor }: HeaderProps) {
  return (
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
  );
}
