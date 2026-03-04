import { NextFunction, Response, Router } from "express";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

const router = Router();

// All routes require authentication
router.use(auth);

// Default columns auto-created with every new dashboard
const DEFAULT_COLUMNS = [
  { name: "ToDo", position: 0 },
  { name: "In Progress", position: 1 },
  { name: "Done", position: 2 },
];

// GET /api/dashboards — List all dashboards for the current user, newest first
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

// GET /api/dashboards/:id/board — Fetch the full board view for a dashboard.
// Returns the dashboard, its columns (sorted by position), and tasks grouped by columnId.
// This is the main data-fetching endpoint for the Kanban board page.
router.get(
  "/:id/board",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Verify dashboard exists and belongs to the authenticated user
      const dashboard = await Dashboard.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      const columns = await Column.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

      const tasks = await Task.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

      // Group tasks into a map of columnId → Task[] for the frontend Kanban layout
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

// POST /api/dashboards — Create a new dashboard with default columns (ToDo, In Progress, Done)
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

      // Auto-create the 3 default columns so the board is immediately usable
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

// PUT /api/dashboards/:id — Rename a dashboard
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

      // findOneAndUpdate with userId ensures users can only rename their own dashboards
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

// DELETE /api/dashboards/:id — Delete a dashboard and cascade-delete all its columns and tasks
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

      // Cascade delete: remove all tasks and columns belonging to this dashboard
      await Task.deleteMany({ dashboardId: dashboard._id });
      await Column.deleteMany({ dashboardId: dashboard._id });

      res.json({ message: "Dashboard deleted successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
