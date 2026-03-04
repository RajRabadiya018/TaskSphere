import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import columnRoutes from "./routes/columns";
import dashboardRoutes from "./routes/dashboards";
import taskRoutes from "./routes/tasks";

// Load .env variables (MONGODB_URI, PORT, JWT_SECRET) into process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the Next.js frontend.
// FRONTEND_URL is set to the Vercel URL in production; falls back to localhost for dev.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route — shows API info when someone visits the base URL after deployment
app.get("/", (_req, res) => {
  res.json({
    name: "Task Sphere API",
    version: "1.0.0",
    description: "Backend API for Task Sphere - Task Management System",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      dashboards: "/api/dashboards",
      columns: "/api/columns",
      tasks: "/api/tasks",
    },
  });
});

// Simple health-check endpoint — useful for monitoring if the API is alive
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Task Sphere API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules — each handles its own sub-routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

// Catch any request that doesn't match a defined route
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler must be registered AFTER all routes
// so it can catch errors thrown/forwarded by any route handler
app.use(errorHandler);

// Connect to MongoDB first, then start listening for requests
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
