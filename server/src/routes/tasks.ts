import crypto from "crypto";
import { NextFunction, Response, Router } from "express";
import mongoose from "mongoose";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

// Helper — validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

const router = Router();

// All routes require authentication
router.use(auth);

// ---------------------------------------------------------------------------
// GET /api/tasks — List ALL tasks for the authenticated user (with filters)
// (used by the task-list / summary views)
// ---------------------------------------------------------------------------
router.get(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { search, priority, dashboardId, status } = req.query;

      // Validate dashboardId if provided
      if (dashboardId && !isValidObjectId(dashboardId as string)) {
        res.status(400).json({ message: "Invalid dashboard ID format" });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = { userId: req.userId };
      if (dashboardId) filter.dashboardId = dashboardId;
      if (priority && priority !== "all") filter.priority = priority;

      // Filter by column name (status): find matching column IDs first
      if (status && status !== "all") {
        const matchingCols = await Column.find({
          name: status as string,
        }).select("_id");
        if (matchingCols.length > 0) {
          filter.columnId = { $in: matchingCols.map((c) => c._id) };
        } else {
          // No columns match this status — return empty result
          res.json([]);
          return;
        }
      }

      const tasks = await Task.find(filter)
        .populate("columnId", "name type")
        .populate("dashboardId", "name")
        .sort({ createdAt: -1 });

      // In-memory search (title + description + assignee)
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

// ---------------------------------------------------------------------------
// GET /api/tasks/stats — Aggregated task-count stats for the authenticated user
// ---------------------------------------------------------------------------
router.get(
  "/stats",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { dashboardId } = req.query;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const match: any = { userId: req.userId };
      if (dashboardId) match.dashboardId = dashboardId;

      // Total tasks
      const total = await Task.countDocuments(match);

      // Overdue tasks (dueDate < now, exclude tasks in "Done" columns)
      const doneColumns = await Column.find({ name: "Done" }).select("_id");
      const doneIds = doneColumns.map((c) => c._id);

      const overdue = await Task.countDocuments({
        ...match,
        dueDate: { $lt: new Date() },
        columnId: { $nin: doneIds },
      });

      // Tasks per column-name (to derive in-progress, completed, etc.)
      const allTasks = await Task.find(match)
        .populate("columnId", "name")
        .select("columnId");

      const byColumn: Record<string, number> = {};
      for (const t of allTasks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ---------------------------------------------------------------------------
// PUT /api/tasks/reorder — Bulk reorder tasks
// (must be defined BEFORE /:id to avoid being matched by the param route)
// ---------------------------------------------------------------------------
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

      // Build a map of columnId -> columnName for any column changes
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

// ---------------------------------------------------------------------------
// POST /api/tasks — Create a new task
// ---------------------------------------------------------------------------
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

      // Verify dashboard ownership
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Verify column exists in this dashboard
      const column = await Column.findOne({
        _id: columnId,
        dashboardId,
      });
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Determine next position in the column
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

// ---------------------------------------------------------------------------
// GET /api/tasks/:id — Get a single task with populated column/dashboard
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// PUT /api/tasks/:id — Update task fields
// ---------------------------------------------------------------------------
router.put(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Prevent updating immutable fields
      const { _id, userId, createdAt, updatedAt, __v, ...updates } = req.body;

      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      // Verify ownership
      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      // If columnId is changing, look up the new column name
      if (updates.columnId && updates.columnId !== task.columnId.toString()) {
        const newCol = await Column.findById(updates.columnId);
        if (newCol) {
          updates.columnName = newCol.name;
        }
      }

      // Auto-generate or clear assigneeId when assignedTo changes.
      // Same assignee name always gets the same assigneeId.
      if ("assignedTo" in updates) {
        const trimmedAssignee = updates.assignedTo?.trim();
        if (trimmedAssignee) {
          // Look for an existing task that already has an ID for this assignee name
          const existing = await Task.findOne({
            assignedTo: trimmedAssignee,
            assigneeId: { $ne: null },
          })
            .select("assigneeId")
            .lean();
          updates.assigneeId = existing
            ? (existing as any).assigneeId
            : `ASN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        } else {
          updates.assigneeId = null; // clear it
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

// ---------------------------------------------------------------------------
// DELETE /api/tasks/:id — Delete a task
// ---------------------------------------------------------------------------
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

      // Verify ownership
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

// ---------------------------------------------------------------------------
// PUT /api/tasks/:id/move — Move task to a different column/position
// ---------------------------------------------------------------------------
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

      // Verify ownership
      if (task.userId.toString() !== req.userId) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      // Look up column name
      const column = await Column.findById(columnId);

      // Update the task's column and position
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

// ---------------------------------------------------------------------------
// PUT /api/tasks/:id/star — Toggle starred status
// ---------------------------------------------------------------------------
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

      task.starred = !task.starred;
      await task.save();

      res.json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
