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

export default function AdminPage() {
  const [board, setBoard] = useState<number[]>(Array(25).fill(0));
  const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null);
  
  // 現在操作中の色
  const [activeColor, setActiveColor] = useState<number>(1);
  // 強制上書きモード（オセロロジックを無視してそのマスだけ変える）
  const [forceMode, setForceMode] = useState<boolean>(false);

  useEffect(() => {
    socket.connect();
    socket.on("gameState", (state: any) => {
      setBoard(state.board);
      setBuzzedPlayer(state.buzzedPlayer);
    });
    return () => {
      socket.off("gameState");
      socket.disconnect();
    };
  }, []);

  const handleResetBuzzer = () => {
    socket.emit("resetBuzzer");
  };

  const handlePanelClick = (index: number) => {
    let newBoard = [...board];

    if (forceMode) {
      // 強制上書きモード
      newBoard[index] = activeColor;
    } else {
      // 通常モード（オセロロジック）
      if (board[index] !== 0) {
        alert("既にパネルが置かれています");
        return;
      }
      const flippable = getFlippablePanels(board, index, activeColor);
      
      // クリックしたマスを塗る
      newBoard[index] = activeColor;
      // 挟んだマスを塗る
      flippable.forEach((fIndex) => {
        newBoard[fIndex] = activeColor;
      });
    }

    socket.emit("updateBoard", newBoard);
  };

  const handleClearBoard = () => {
    if (confirm("本当に盤面をすべてリセットしますか？")) {
      socket.emit("updateBoard", Array(25).fill(0));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">司会者コントロールパネル</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側：早押し管理 */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">早押し・プレイヤー状態</h2>
            <button 
              onClick={() => {
                if(confirm("全てのプレイヤーを退出させ、早押し状態をリセットしますか？")) {
                  socket.emit("resetPlayers");
                }
              }} 
              className="text-sm text-red-600 hover:underline"
            >
              プレイヤーをリセット
            </button>
          </div>
          {buzzedPlayer ? (
            <div className="mb-6">
              <p className="text-2xl font-bold text-red-600 mb-2">解答者: {buzzedPlayer}</p>
              <button 
                onClick={handleResetBuzzer}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 w-full"
              >
                解答終了（待機状態に戻す）
              </button>
            </div>
          ) : (
            <p className="text-slate-500 mb-6">誰も押していません（待機中）</p>
          )}

          <hr className="my-6" />

          <h2 className="text-xl font-bold mb-4">操作する色を選択</h2>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 0].map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                className={`w-16 h-16 rounded font-bold transition-all ${COLOR_CLASSES[c]} ${activeColor === c ? "ring-4 ring-orange-400 scale-110" : "opacity-70"}`}
              >
                {COLOR_NAMES[c]}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-4 p-4 bg-slate-100 rounded">
            <input 
              type="checkbox" 
              checked={forceMode} 
              onChange={(e) => setForceMode(e.target.checked)} 
              className="w-5 h-5"
            />
            <span className="font-bold text-slate-700">強制上書きモード (挟む判定を無視)</span>
          </label>
        </div>

        {/* 右側：パネル操作 */}
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
      </div>
    </div>
  );
}

