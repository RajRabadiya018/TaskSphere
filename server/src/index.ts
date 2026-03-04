import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import columnRoutes from "./routes/columns";
import dashboardRoutes from "./routes/dashboards";
import taskRoutes from "./routes/tasks";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// CORS — allow the Next.js frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Task Sphere API is running",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

// ---------------------------------------------------------------------------
// 404 handler — unknown routes
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ---------------------------------------------------------------------------
// Global Error Handler (must be after all routes)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
