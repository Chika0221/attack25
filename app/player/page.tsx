"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socketClient";

export default function PlayerPage() {
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [buzzerLocked, setBuzzerLocked] = useState(false);
  const [buzzedPlayer, setBuzzedPlayer] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<number | null>(null);

  useEffect(() => {
    socket.connect();

    socket.on("gameState", (state: any) => {
      setBuzzerLocked(state.buzzerLocked);
      setBuzzedPlayer(state.buzzedPlayer);
    });

    socket.on("forceLeave", () => {
      setHasJoined(false);
      setMyColor(null);
      setName("");
      alert("ゲームがリセットされたため、退出しました。");
    });

    return () => {
      socket.off("gameState");
      socket.off("forceLeave");
      socket.disconnect();
    };
  }, []);

  const handleBuzz = () => {
    if (!buzzerLocked) {
      // サーバーに早押しを送信（コンマ数秒の遅れならサーバー側で一番早い人がロックを取る）
      socket.emit("buzz", name);
    }
  };

  const joinGame = () => {
    if (!name.trim()) return;
    socket.emit("join", name.trim(), (res: any) => {
      if (res.success) {
        setHasJoined(true);
        setMyColor(res.color);
      } else {
        alert(res.message);
      }
    });
  };

  const leaveGame = () => {
    if (confirm("本当に退出しますか？")) {
      socket.emit("leave");
      setHasJoined(false);
      setMyColor(null);
      setName("");
    }
  };

  // 名前入力画面
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">参加者のお名前</h1>
          <input
            type="text"
            className="w-full p-4 text-xl rounded-xl border-2 border-slate-600 bg-slate-900 text-white focus:border-blue-500 focus:outline-none mb-6"
            placeholder="例: 情報太郎"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={joinGame}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xl transition-colors shadow-lg"
          >
            参加する
          </button>
        </div>
      </div>
    );
  }

  // 早押しボタン画面
  const amIWinner = buzzedPlayer === name;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      <button
        onClick={leaveGame}
        className="absolute top-4 right-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm transition-colors border border-slate-600"
      >
        退出する
      </button>

      <div className="text-white text-xl mb-12">
        参加者: <span className="font-bold">{name}</span> さん
      </div>

      <button
        onClick={handleBuzz}
        disabled={buzzerLocked}
        className={`
          relative w-64 h-64 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
          flex items-center justify-center text-4xl font-black transition-all duration-100
          ${
            amIWinner
              ? "bg-yellow-400 text-yellow-900 scale-110 shadow-[0_0_50px_rgba(250,204,21,0.6)]" // 自分がおした！
              : buzzerLocked
              ? "bg-slate-700 text-slate-500 transform translate-y-2 shadow-none" // 他の人が押した or ロック中
              : myColor === 1 ? "bg-red-600 hover:bg-red-500 active:bg-red-700 active:translate-y-4 active:shadow-none text-white cursor-pointer"
              : myColor === 2 ? "bg-green-600 hover:bg-green-500 active:bg-green-700 active:translate-y-4 active:shadow-none text-white cursor-pointer"
              : myColor === 3 ? "bg-slate-100 hover:bg-white active:bg-slate-200 active:translate-y-4 active:shadow-none text-slate-900 cursor-pointer"
              : myColor === 4 ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:translate-y-4 active:shadow-none text-white cursor-pointer"
              : "bg-red-600 hover:bg-red-500 active:bg-red-700 active:translate-y-4 active:shadow-none text-white cursor-pointer" // 押せる状態 (フォールバック)
          }
        `}
      >
        <div className="absolute inset-2 rounded-full border-4 border-black/10"></div>
        {amIWinner ? "!! 解答権獲得 !!" : "BUZZ"}
      </button>

      <div className="mt-12 h-16">
        {buzzedPlayer && !amIWinner && (
          <p className="text-2xl font-bold text-red-400">
            {buzzedPlayer} さんが解答中！
          </p>
        )}
      </div>
    </div>
  );
}
