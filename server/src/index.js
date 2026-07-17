require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Without these, ONE unhandled error anywhere in the app (a bad promise rejection deep in a
// route, a flaky network call, etc.) kills the entire Node process — every other route goes
// down with it until someone manually restarts the server. That's what turns a single failed
// request into every endpoint returning ECONNREFUSED. Log-and-continue instead: the request
// that caused it still fails, but the server (and everyone else's requests) stay up.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] This did not crash the server, but should be fixed:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] This did not crash the server, but should be fixed:", err);
});

const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const plannerRoutes = require("./routes/planner");
const pomodoroRoutes = require("./routes/pomodoro");
const cgpaRoutes = require("./routes/cgpa");
const attendanceRoutes = require("./routes/attendance");
const pdfRoutes = require("./routes/pdf");
const coinsRoutes = require("./routes/coins");
const mockExamsRoutes = require("./routes/mockExams");
const facultyRoutes = require("./routes/faculty");
const coursesRoutes = require("./routes/courses");
const chatRoutes = require("./routes/chat");
const visionRoutes = require("./routes/vision");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "StudySphere AI backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/cgpa", cgpaRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/coins", coinsRoutes);
app.use("/api/mockexams", mockExamsRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vision", visionRoutes);



// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 StudySphere AI backend is running on port ${PORT}`);
});