import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Route Imports
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import listingRoutes from "./routes/listingRoutes.js"; 
import roommateRoutes from "./routes/roommateRoutes.js";
import checklistRoutes from "./routes/checklistRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; 
import requestChatRoutes from "./routes/chatRoutes2.js"; 
import notificationRoutes from "./routes/notificationRoutes.js";
import announcementRoutes from './routes/announcements.js';
import adminsettingsRoutes from "./routes/adminsettingsRoutes.js";
import housingRoutes from "./routes/housingRoutes.js";
import requestRoutes from "./routes/requestRoutes.js"; 

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🟢 1. CORS Setup
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 🟢 2. Socket.io Setup
const io = new Server(server, {
  cors: { 
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// Global IO for use in controllers (Very Important for Proper Notifications)
global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 New Socket Connected:", socket.id);

  // 🔹 Join private room (For real-time Bell Notifications)
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`📡 User Joined Private Room: ${userId}`);
    }
  });

  // 🔹 Join request-based chat room (For active Chat screen window)
  socket.on("join_chat", (requestId) => {
    if (requestId) {
      socket.join(requestId.toString());
      console.log(`💬 User Joined Chat Room: ${requestId}`);
    }
  });

  // 🔹 Send message logic
  socket.on("send_message", (data) => {
    const { requestId } = data;

    if (requestId) {
      
      socket.to(requestId.toString()).emit("receive_message", data);
      console.log(`📩 Message emitted in chat room: ${requestId}`);

     
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// 🟢 3. API Routes
app.get("/", (req, res) => res.send("🌍 SettleIn Backend Running..."));

app.use("/api/admin", adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/roommates", roommateRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/settings", settingsRoutes);

// CHAT ROUTES
app.use("/api/chat", chatRoutes); 
app.use("/api/request-chat", requestChatRoutes); 

app.use("/api/notifications", notificationRoutes);
app.use("/api/admin-settings", adminsettingsRoutes);
app.use("/api/housing", housingRoutes); 
app.use("/api/requests", requestRoutes);

// 🟢 4. MongoDB + Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err));