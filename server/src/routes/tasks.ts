
import { NextFunction, Response, Router } from "express";
import mongoose from "mongoose";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const router = Router();

router.use(auth);

router.get(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { search, priority, dashboardId, status } = req.query;

      if (dashboardId && !isValidObjectId(dashboardId as string)) {
        res.status(400).json({ message: "Invalid dashboard ID format" });
        return;
      }

      const filter: any = { userId: req.userId };
      if (dashboardId) filter.dashboardId = dashboardId;
      if (priority && priority !== "all") filter.priority = priority;

      if (status && status !== "all") {
        const matchingCols = await Column.find({
          name: status as string,
        }).select("_id");
        if (matchingCols.length > 0) {
          filter.columnId = { $in: matchingCols.map((c) => c._id) };
        } else {
          res.json([]);
          return;
        }
      }
      const tasks = await Task.find(filter)
        .populate("columnId", "name type")
        .populate("dashboardId", "name")
        .sort({ createdAt: -1 });

      // serch by title and assignee

      let result = tasks;
      if (search) {
        const q = (search as string).toLowerCase();
        result = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.assignedTo && t.assignedTo.toLowerCase().includes(q)),
        );
      }

      res.json(result);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.get(
  "/stats",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { dashboardId } = req.query;

      const match: any = { userId: req.userId };
      if (dashboardId) match.dashboardId = dashboardId;

      const total = await Task.countDocuments(match);

      const doneColumns = await Column.find({ name: "Done" }).select("_id");
      const doneIds = doneColumns.map((c) => c._id);

      const overdue = await Task.countDocuments({
        ...match,
        dueDate: { $lt: new Date() },
        columnId: { $nin: doneIds },
      });
      const allTasks = await Task.find(match)
        .populate("columnId", "name")
        .select("columnId");

      const byColumn: Record<string, number> = {};
      for (const t of allTasks) {
        const colName =
          typeof t.columnId === "object" &&
            t.columnId !== null &&
            "name" in (t.columnId as any)
            ? (t.columnId as any).name
            : "Unknown";
        byColumn[colName] = (byColumn[colName] || 0) + 1;
      }

      res.json({ total, overdue, byColumn });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// for DND put api to reorder tasks
router.put(
  "/reorder",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { tasks } = req.body;

      if (!Array.isArray(tasks) || tasks.length === 0) {
        res.status(400).json({
          message: "tasks array is required with [{ id, position }]",
        });
        return;
      }
      const columnIds = [
        ...new Set(
          tasks
            .filter((t: { columnId?: string }) => t.columnId)
            .map((t: { columnId?: string }) => t.columnId),
        ),
      ];
      const columnNameMap: Record<string, string> = {};
      if (columnIds.length > 0) {
        const cols = await Column.find({ _id: { $in: columnIds } }).select(
          "_id name",
        );
        for (const c of cols) {
          columnNameMap[c._id.toString()] = c.name;
        }
      }

      const bulkOps = tasks.map(
        (t: { id: string; position: number; columnId?: string }) => ({
          updateOne: {
            filter: { _id: t.id },
            update: {
              position: t.position,
              ...(t.columnId && {
                columnId: t.columnId,
                columnName: columnNameMap[t.columnId] || "",
              }),
            },
          },
        }),
      );

      await Task.bulkWrite(bulkOps);

      res.json({ message: "Tasks reordered successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

//Create a new task in a specific column of a dashboard

router.post(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const {
        columnId,
        dashboardId,
        title,
        description,
        priority,
        dueDate,
        tags,
        assignedTo,
      } = req.body;

      if (!columnId || !dashboardId || !title || !title.trim()) {
        res.status(400).json({
          message: "columnId, dashboardId, and title are required",
        });
        return;
      }

      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }
      const column = await Column.findOne({
        _id: columnId,
        dashboardId,
      });
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      const maxPosTask = await Task.findOne({ columnId }).sort({
        position: -1,
      });
      const nextPosition = maxPosTask ? maxPosTask.position + 1 : 0;

      const task = await Task.create({
        columnId,
        columnName: column.name,
        dashboardId,
        userId: req.userId,
        title: title.trim(),
        description: description || "",
        priority: priority || "medium",
        dueDate: dueDate || undefined,
        tags: tags || [],
        assignedTo: assignedTo || "",
        position: nextPosition,
      });

      res.status(201).json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id)
        .populate("columnId", "name type")
        .populate("dashboardId", "name");

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// Update task fields data
router.put(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { _id, userId, createdAt, updatedAt, __v, ...updates } = req.body;

      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (updates.columnId && updates.columnId !== task.columnId.toString()) {
        const newCol = await Column.findById(updates.columnId);
        if (newCol) {
          updates.columnName = newCol.name;
        }
      }



      const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      res.json(updatedTask);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// Delete a task 
router.delete(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      await Task.findByIdAndDelete(req.params.id);

      res.json({ message: "Task deleted successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// Move a task to a different column position.
router.put(
  "/:id/move",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { columnId, position } = req.body;

      if (!columnId || position === undefined) {
        res.status(400).json({
          message: "columnId and position are required",
        });
        return;
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const column = await Column.findById(columnId);

      task.columnId = columnId;
      task.columnName = column ? column.name : "";
      task.position = position;
      await task.save();

      res.json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

router.put(
  "/:id/star",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      // Star and undo
      task.starred = !task.starred;
      await task.save();

      res.json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
