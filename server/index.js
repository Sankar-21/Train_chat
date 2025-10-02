const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Store online users per coach (room)
const onlineUsersByCoach = {};
// Store messages per coach (room)
const messagesByCoach = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user joins, they provide user and journeyDetails
  socket.on("join", ({ user, journeyDetails }) => {
    const coach = journeyDetails.coach.trim().toLowerCase();
    console.log(
      `User ${user.name} joining coach room: '${coach}' (socket: ${socket.id})`
    );
    socket.join(coach);
    socket.data.user = user;
    socket.data.coach = coach;

    if (!onlineUsersByCoach[coach]) onlineUsersByCoach[coach] = [];
    if (!messagesByCoach[coach]) messagesByCoach[coach] = [];
    // Only add user if not already present (by id)
    if (!onlineUsersByCoach[coach].some((u) => u.id === user.id)) {
      onlineUsersByCoach[coach].push({ ...user, socketId: socket.id });
    }

    // Broadcast updated user list to room
    io.to(coach).emit("user list", onlineUsersByCoach[coach]);
    // Send current message history to the newly joined user
    socket.emit("message history", messagesByCoach[coach]);
    // System message
    io.to(coach).emit("system message", `${user.name} joined the chat.`);
  });

  // Chat message to room
  socket.on("chat message", (msg) => {
    const coach = socket.data.coach;
    console.log(
      `Broadcasting message to coach room: '${coach}' (socket: ${socket.id})`
    );
    if (coach) {
      // Store message in history
      messagesByCoach[coach].push(msg);
      io.to(coach).emit("chat message", msg);
    }
  });

  // Emoji reaction sync
  socket.on("toggle reaction", ({ messageId, emoji, userId }) => {
    const coach = socket.data.coach;
    if (!coach || !messagesByCoach[coach]) return;
    // Find the message in the room's message history
    const msgIndex = messagesByCoach[coach].findIndex(
      (m) => m.id === messageId
    );
    if (msgIndex === -1) return;
    const msg = messagesByCoach[coach][msgIndex];
    const reactions = { ...(msg.reactions || {}) };
    const reactors = reactions[emoji] || [];
    if (reactors.includes(userId)) {
      // Remove reaction
      reactions[emoji] = reactors.filter((id) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji] = [...reactors, userId];
    }
    messagesByCoach[coach][msgIndex] = { ...msg, reactions };
    // Broadcast updated message to all clients in the room
    io.to(coach).emit("message updated", messagesByCoach[coach][msgIndex]);
  });

  socket.on("disconnect", () => {
    const coach = socket.data.coach;
    const user = socket.data.user;
    if (coach && onlineUsersByCoach[coach]) {
      onlineUsersByCoach[coach] = onlineUsersByCoach[coach].filter(
        (u) => u.socketId !== socket.id
      );
      io.to(coach).emit("user list", onlineUsersByCoach[coach]);
      if (user) {
        io.to(coach).emit("system message", `${user.name} left the chat.`);
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
