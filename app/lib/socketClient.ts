import { io } from "socket.io-client";

export const socket = io(); // 同一オリジン（localhost:3000など）に自動で接続します
