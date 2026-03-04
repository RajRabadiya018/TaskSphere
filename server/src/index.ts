import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import columnRoutes from "./routes/columns";
import dashboardRoutes from "./routes/dashboards";
import taskRoutes from "./routes/tasks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
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

//health-check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Task Sphere API is running",
    timestamp: new Date().toISOString(),
  });
});

// route modules
app.use("/api/auth", authRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// global error handler
app.use(errorHandler);

// Connection to MongoDB 
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
