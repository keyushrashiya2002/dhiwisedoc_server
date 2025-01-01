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
app.use("/api/document", route.documentRoute);

// Static
app.use("/file", express.static(join(process.cwd(), "uploads")));

let users = {}; // To keep track of connected users and their positions

io.on("connection", (socket) => {
  console.log("a user connected");

  // When a user moves the cursor or edits the document
  socket.on("cursorMove", (data) => {
    users[socket.id] = {
      userId: data.userId,
      username: data.username,
      cursor: data.cursor,
    };
    io.emit("updateCursors", users); // Send updated cursor positions to all clients
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete users[socket.id]; // Remove the user when they disconnect
    io.emit("updateCursors", users); // Update other clients with the change
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
