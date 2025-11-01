const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const attendanceRoutes = require("./routes/attendance");
const projectRoutes = require("./routes/projects");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const employeeRoutes = require("./routes/employees");
const timesheetRoutes = require("./routes/timesheets");
const leaveRoutes = require("./routes/leaves");
const holidayRoutes = require("./routes/holidays");
const appreciationRoutes = require("./routes/appreciation");
const noticeRoutes = require("./routes/noticeRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// ✅ Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/appreciations", appreciationRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/tickets", ticketRoutes);

app.use("/uploads", express.static("uploads"));
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ Store online users
let onlineUsers = new Map();

// ✅ Socket connections
io.on("connection", (socket) => {
  console.log("✅ New user connected :", socket.id);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("typing", ({ to, from }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { from });
    }
  });

  // ✅ Ticket created or assigned
  socket.on("ticketNotify", ({ to, ticketId, message }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("newTicketAlert", { ticketId, message });
    }
  });

  // ✅ New comment on ticket
  socket.on("ticketComment", ({ to, ticketId }) => {
    const receiverSocket = onlineUsers.get(to);
    if (receiverSocket) {
      io.to(receiverSocket).emit("ticketCommentUpdate", { ticketId });
    }
  });

  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);

    const userId = [...onlineUsers.entries()].find(
      ([uid, sid]) => sid === socket.id
    )?.[0];

    if (userId) {
      onlineUsers.delete(userId);

      const User = require("./models/User");
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }

    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ✅ Start server with socket.io
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server & WebSocket running on port ${PORT}`)
);
