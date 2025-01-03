import express from "express";
import morgan from "morgan";
import http from "http";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";

import { CLIENT_URL, DATABASE_URL, PORT } from "./config/env.js";
import { connectDb } from "./helper/connectDb.js";
import { decryptDataFun } from "./helper/cryptoFun.js";

import * as route from "./router.js";
import { verifyUser } from "./middleware/verifyMiddleware.js";
import { updateDocumentContent } from "./features/document/controller.js";

// initialize server
const app = express();
const server = http.createServer(app);
// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL, // Allow the frontend to connect from this port
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

const users = {}; // Store user data by socket ID

/**
 * Helper function to get all users in a room
 * @param {string} roomId - The room ID
 * @returns {object} Users in the room
 */
const getUsersInRoom = (roomId) => {
  return Object.values(users).filter((user) => user.roomId === roomId);
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user joins a room
  socket.on("joinRoom", ({ roomId, userId, username }) => {
    if (!roomId || !userId || !username) {
      console.error("Invalid joinRoom payload:", { roomId, userId, username });
      return;
    }

    // Add user to room and track their data
    socket.join(roomId);
    users[socket.id] = { userId, username, cursor: { x: 0, y: 0 }, roomId };

    console.log(`User ${username} joined room ${roomId}`);
    io.to(roomId).emit("updateCursors", getUsersInRoom(roomId));
  });

  // When a user moves their cursor
  socket.on("cursorMove", ({ roomId, cursor }) => {
    if (users[socket.id]) {
      users[socket.id].cursor = cursor; // Update cursor position
      io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Notify all clients in the room
    }
  });

  let updateTimeout;
  // When a user edits the document
  socket.on("editorChange", ({ roomId, userId, content }) => {
    if (!roomId || !userId || typeof content !== "string") {
      console.error("Invalid editorChange payload:", {
        roomId,
        userId,
        content,
      });
      return;
    }

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
      await updateDocumentContent(roomId, content);
      console.log("Debounced update saved to DB.");
    }, 2000);

    socket.to(roomId).emit("contentUpdate", { userId, content });
  });

  // When a user leaves a room
  socket.on("leaveRoom", (roomId) => {
    const user = users[socket.id];
    if (user && user.roomId === roomId) {
      delete users[socket.id]; // Remove the user from the server's data
      socket.leave(roomId);
      console.log(`User ${user.username} left room ${roomId}`);
      io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Notify all clients in the room
    }
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const { roomId, username } = user;
      delete users[socket.id]; // Remove user data
      console.log(`User ${username} disconnected from room ${roomId}`);
      io.to(roomId).emit("updateCursors", getUsersInRoom(roomId)); // Notify all clients in the room
    }
  });
});

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
