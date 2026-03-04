import { NextFunction, Response, Router } from "express";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

const router = Router();

router.use(auth);

const DEFAULT_COLUMNS = [
  { name: "ToDo", position: 0 },
  { name: "In Progress", position: 1 },
  { name: "Done", position: 2 },
];

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

      const columns = await Column.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

      const tasks = await Task.find({
        dashboardId: dashboard._id,
      }).sort({ position: 1 });

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

      await Task.deleteMany({ dashboardId: dashboard._id });
      await Column.deleteMany({ dashboardId: dashboard._id });

      res.json({ message: "Dashboard deleted successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
