import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server } from "socket.io";
import sequelize from "./config/db.config.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // { roomId: [{ socketId, username }] }

io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    if (!roomId || !username) return;

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, username });
    socket.join(roomId);

    console.log(`👥 ${username} joined room ${roomId}`);
    rooms[roomId].forEach((user) => {
      if (user.socketId !== socket.id) {
        io.to(user.socketId).emit("user-joined", { username, id: socket.id });
        socket.emit("user-joined", {
          username: user.username,
          id: user.socketId,
        });
      }
    });
  });

  socket.on("send-message", ({ roomId, message, username }) => {
    if (!roomId || !message || !username) return;
    io.to(roomId).emit("receive-message", { username, message });
  });

  // WebRTC signaling
  socket.on("offer", ({ offer, roomId, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, roomId, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("candidate", ({ candidate, roomId, to }) => {
    io.to(to).emit("candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    for (const roomId in rooms) {
      const user = rooms[roomId].find((u) => u.socketId === socket.id);
      const username = user?.username || "Unknown";

      const updated = rooms[roomId].filter((u) => u.socketId !== socket.id);
      if (updated.length === 0) {
        delete rooms[roomId];
      } else {
        rooms[roomId] = updated;
        socket.to(roomId).emit("user-left", { id: socket.id, username });
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("✅ Backend running and accessible over LAN!");
});

app.use("/api/user", userRoutes);

sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ DB sync error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on LAN: http://192.168.10.103:${PORT}`);
});
