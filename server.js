const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // ゲームの全体状態
  let gameState = {
    buzzerLocked: false,
    buzzedPlayer: null,
    // 5x5の盤面。0:空, 1:赤, 2:緑, 3:白, 4:青
    board: Array(25).fill(0),
    players: [], // { id, name, color }
  };

  io.on("connection", (socket) => {
    console.log("クライアントが接続しました:", socket.id);

    // 接続した瞬間に現在の状態をクライアントに送る
    socket.emit("gameState", gameState);

    // 参加処理
    socket.on("join", (name, callback) => {
      if (gameState.players.find(p => p.id === socket.id)) {
        return callback({ success: false, message: "既に参加しています。" });
      }
      
      if (gameState.players.length >= 4) {
        return callback({ success: false, message: "すでに4名参加しているため、これ以上参加できません。" });
      }

      // 未使用の色を割り当てる (1:赤, 2:緑, 3:白, 4:青)
      const usedColors = gameState.players.map(p => p.color);
      const availableColors = [1, 2, 3, 4].filter(c => !usedColors.includes(c));
      const color = availableColors[0];

      const player = { id: socket.id, name, color };
      gameState.players.push(player);
      
      console.log(`参加: ${name} (色: ${color})`);
      io.emit("gameState", gameState);

      callback({ success: true, color });
    });

    // 早押しボタンが押された時
    socket.on("buzz", (playerName) => {
      if (!gameState.buzzerLocked) {
        gameState.buzzerLocked = true;
        gameState.buzzedPlayer = playerName;
        console.log(`早押し成功: ${playerName}`);
        
        // 全員に状態をブロードキャストして、他の人のボタンを無効化する
        io.emit("gameState", gameState);
      }
    });

    // 司会者が早押し状態をリセットした時
    socket.on("resetBuzzer", () => {
      gameState.buzzerLocked = false;
      gameState.buzzedPlayer = null;
      io.emit("gameState", gameState);
    });

    // パネルが更新された時
    socket.on("updateBoard", (newBoard) => {
      gameState.board = newBoard;
      io.emit("gameState", gameState);
    });

    // ゲーム（全プレイヤー）のリセット
    socket.on("resetPlayers", () => {
      gameState.players = [];
      gameState.buzzerLocked = false;
      gameState.buzzedPlayer = null;
      io.emit("gameState", gameState);
      io.emit("forceLeave");
      console.log("全プレイヤーをリセットしました");
    });

    // プレイヤーの自発的な退室
    socket.on("leave", () => {
      const index = gameState.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        console.log(`退室(自主): ${gameState.players[index].name}`);
        gameState.players.splice(index, 1);
        io.emit("gameState", gameState);
      }
    });

    socket.on("disconnect", () => {
      console.log("クライアントが切断しました:", socket.id);
      const index = gameState.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        console.log(`退室: ${gameState.players[index].name}`);
        gameState.players.splice(index, 1);
        io.emit("gameState", gameState);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
