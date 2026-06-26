import React from "react";
import { socket } from "../../lib/socketClient";

const COLOR_NAMES = ["空", "赤", "緑", "白", "青"];
const COLOR_CLASSES = [
  "bg-slate-700 text-slate-500", // 0
  "bg-red-500 text-white",       // 1
  "bg-green-500 text-white",     // 2
  "bg-white text-black border",  // 3
  "bg-blue-500 text-white"       // 4
];

interface AdminPanelBoardProps {
  board: number[];
  activeColor: number;
  handlePanelClick: (index: number) => void;
}

export function AdminPanelBoard({ board, activeColor, handlePanelClick }: AdminPanelBoardProps) {
  const handleClearBoard = () => {
    if (confirm("本当に盤面をすべてリセットしますか？")) {
      socket.emit("updateBoard", Array(25).fill(0));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">パネル操作</h2>
        <button onClick={handleClearBoard} className="text-sm text-red-600 hover:underline">
          盤面をリセット
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        現在の色: <span className="font-bold">{COLOR_NAMES[activeColor]}</span>
      </p>
      
      <div className="grid grid-cols-5 gap-1 w-full max-w-sm aspect-square bg-slate-800 p-2 rounded mx-auto">
        {board.map((color, i) => (
          <div
            key={i}
            onClick={() => handlePanelClick(i)}
            className={`flex items-center justify-center font-bold cursor-pointer text-xl hover:opacity-80 transition-opacity
              ${COLOR_CLASSES[color]}
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
