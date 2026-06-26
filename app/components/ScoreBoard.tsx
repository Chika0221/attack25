import React from "react";

interface ScoreBoardProps {
  counts: {
    red: number;
    green: number;
    white: number;
    blue: number;
  };
}

export function ScoreBoard({ counts }: ScoreBoardProps) {
  return (
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
  );
}
