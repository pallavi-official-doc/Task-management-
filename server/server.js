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

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
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
app.use("/api/holidays", require("./routes/holidays"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
