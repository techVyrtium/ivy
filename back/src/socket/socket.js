import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; //contain all the corresponding user's socket id

export const getReceiverSocketId = (receiverId) => userSocketMap?.[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query?.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`a user connected, sockedId: ${socket.id}, userId: ${userId}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`Disconnected, sockedId: ${socket.id}, userId: ${userId}`);

      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { app, io, server };
