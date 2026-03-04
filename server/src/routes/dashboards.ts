import { NextFunction, Response, Router } from "express";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

const router = Router();

// All routes require authentication
router.use(auth);

// Default columns created with every new dashboard
const DEFAULT_COLUMNS = [
  { name: "ToDo", position: 0 },
  { name: "In Progress", position: 1 },
  { name: "Done", position: 2 },
];

// ---------------------------------------------------------------------------
// GET /api/dashboards — List all dashboards for the current user
// ---------------------------------------------------------------------------
router.get(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dashboards = await Dashboard.find({ userId: req.userId }).sort({
        createdAt: -1,
      });
      res.json(dashboards);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/dashboards/:id/board — Get full board (columns + tasks)
// ---------------------------------------------------------------------------
router.get(
  "/:id/board",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dashboard = await Dashboard.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Fetch columns sorted by position
      const columns = await Column.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

      // Fetch all tasks for this dashboard sorted by position
      const tasks = await Task.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

      // Group tasks by columnId
      const tasksByColumn: Record<string, typeof tasks> = {};
      for (const col of columns) {
        tasksByColumn[col._id.toString()] = [];
      }
      for (const task of tasks) {
        const colId = task.columnId.toString();
        if (!tasksByColumn[colId]) {
          tasksByColumn[colId] = [];
        }
        tasksByColumn[colId].push(task);
      }

      res.json({
        dashboard,
        columns,
        tasks: tasksByColumn,
      });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/dashboards — Create a new dashboard (with default columns)
// ---------------------------------------------------------------------------
router.post(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ message: "Dashboard name is required" });
        return;
      }

      if (name.trim().length > 50) {
        res.status(400).json({
          message: "Dashboard name must be at most 50 characters",
        });
        return;
      }

      const dashboard = await Dashboard.create({
        name: name.trim(),
        userId: req.userId,
      });

      // Auto-create default columns
      await Column.insertMany(
        DEFAULT_COLUMNS.map((col) => ({
          dashboardId: dashboard._id,
          name: col.name,
          type: "default",
          position: col.position,
        })),
      );

      res.status(201).json(dashboard);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// PUT /api/dashboards/:id — Rename a dashboard
// ---------------------------------------------------------------------------
router.put(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ message: "Dashboard name is required" });
        return;
      }

      if (name.trim().length > 50) {
        res.status(400).json({
          message: "Dashboard name must be at most 50 characters",
        });
        return;
      }

      const dashboard = await Dashboard.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { name: name.trim() },
        { new: true, runValidators: true },
      );

      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      res.json(dashboard);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// ---------------------------------------------------------------------------
// DELETE /api/dashboards/:id — Delete dashboard + cascade columns & tasks
// ---------------------------------------------------------------------------
router.delete(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dashboard = await Dashboard.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Cascade: delete all columns and tasks for this dashboard
      await Task.deleteMany({ dashboardId: dashboard._id });
      await Column.deleteMany({ dashboardId: dashboard._id });

      res.json({ message: "Dashboard deleted successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
