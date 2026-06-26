"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socketClient";

import { JoinScreen } from "../components/player/JoinScreen";
import { BuzzerScreen } from "../components/player/BuzzerScreen";

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

  if (!hasJoined) {
    return <JoinScreen name={name} setName={setName} joinGame={joinGame} />;
  }

  return (
    <BuzzerScreen
      name={name}
      myColor={myColor}
      buzzerLocked={buzzerLocked}
      buzzedPlayer={buzzedPlayer}
      handleBuzz={handleBuzz}
      leaveGame={leaveGame}
    />
  );
}
