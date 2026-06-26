import React from "react";

interface JoinScreenProps {
  name: string;
  setName: (n: string) => void;
  joinGame: () => void;
}

export function JoinScreen({ name, setName, joinGame }: JoinScreenProps) {
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
