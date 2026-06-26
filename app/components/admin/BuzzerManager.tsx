import React from "react";
import { socket } from "../../lib/socketClient";

interface BuzzerManagerProps {
  buzzedPlayer: string | null;
  activeColor: number;
  setActiveColor: (c: number) => void;
  forceMode: boolean;
  setForceMode: (m: boolean) => void;
}

const COLOR_NAMES = ["空", "赤", "緑", "白", "青"];
const COLOR_CLASSES = [
  "bg-slate-700 text-slate-500", // 0
  "bg-red-500 text-white",       // 1
  "bg-green-500 text-white",     // 2
  "bg-white text-black border",  // 3
  "bg-blue-500 text-white"       // 4
];

export function BuzzerManager({ buzzedPlayer, activeColor, setActiveColor, forceMode, setForceMode }: BuzzerManagerProps) {
  const handleResetBuzzer = () => {
    socket.emit("resetBuzzer");
  };

  const handleResetPlayers = () => {
    if (confirm("全てのプレイヤーを退出させ、早押し状態をリセットしますか？")) {
      socket.emit("resetPlayers");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">早押し・プレイヤー状態</h2>
        <button 
          onClick={handleResetPlayers} 
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
  );
}
