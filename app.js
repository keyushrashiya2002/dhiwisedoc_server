import express from "express";
import morgan from "morgan";
import http from "http";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";

import { DATABASE_URL, PORT } from "./config/env.js";
import { connectDb } from "./helper/connectDb.js";
import { decryptDataFun } from "./helper/cryptoFun.js";

import * as route from "./router.js";
import { verifyUser } from "./middleware/verifyMiddleware.js";

// initialize server
const app = express();
const server = http.createServer(app);
// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8001", // Allow the frontend to connect from this port
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Allow cookies if needed
  },
});

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));

// Handle Client Server
var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDb(DATABASE_URL);

// Public Routes
app.use(decryptDataFun);
app.use("/api/user", route.userRoute);

// Private Routes
app.use(verifyUser);
app.use("/api/document", route.documentRoute);

// Static
app.use("/file", express.static(join(process.cwd(), "uploads")));

const users = {}; // Store user data keyed by socket ID

io.on("connection", (socket) => {
  console.log("A user connected");

  // When a user joins a document (room)
  socket.on("joinRoom", ({ roomId, userId, username }) => {
    socket.join(roomId); // Join the specified room
    console.log(`User ${username} joined room: ${roomId}`);
    users[socket.id] = { userId, username, cursor: { x: 0, y: 0 }, roomId };
    io.to(roomId).emit("updateCursors", getUsersInRoom(roomId));
  });

  // When a user moves the cursor or edits the document
  socket.on("cursorMove", ({ roomId, cursor }) => {
    if (users[socket.id]) {
      users[socket.id].cursor = cursor; // Update the user's cursor position
      io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Send updated cursor positions to the room
    }
  });

  // When a user leaves a room
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${users[socket.id]?.username} left room: ${roomId}`);
    delete users[socket.id]; // Remove the user from the server's data
    io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Update other clients in the room
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const { roomId, username } = user;
      console.log(`User ${username} disconnected from room: ${roomId}`);
      delete users[socket.id]; // Remove the user from the server's data
      io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Update other clients in the room
    }
  });
});

// Helper function to get all users in a room
const getUsersInRoom = (roomId) => {
  return Object.values(users).filter((user) => user.roomId === roomId);
};

// Start listing server
server.listen(PORT, () => {
  console.log(`start listening on port http://localhost:${PORT}`);
});

// Uncaught exceptions and unhandled rejections
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err);
});
