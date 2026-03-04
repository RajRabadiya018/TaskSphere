import crypto from "crypto";
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

// GET /api/tasks — List all tasks for the authenticated user with optional filters.
// Supports query params: search, priority, dashboardId, status (column name).
// Used by the task list page (not the Kanban board, which uses /dashboards/:id/board).
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

      // Build a MongoDB filter object dynamically based on provided query params
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = { userId: req.userId };
      if (dashboardId) filter.dashboardId = dashboardId;
      if (priority && priority !== "all") filter.priority = priority;

      // Status filtering: "status" refers to a column name (e.g. "ToDo", "In Progress").
      // We find columns with that name, then filter tasks by those column IDs.
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

      // Populate columnId and dashboardId to include their names in the response
      const tasks = await Task.find(filter)
        .populate("columnId", "name type")
        .populate("dashboardId", "name")
        .sort({ createdAt: -1 });

      // Text search is done in-memory (searches title, description, and assignee)
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

// GET /api/tasks/stats — Aggregated task counts for the dashboard summary cards.
// Returns: total count, overdue count (excluding Done), and counts grouped by column name.
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

      const total = await Task.countDocuments(match);

      // Overdue = tasks with dueDate in the past, excluding tasks in "Done" columns
      const doneColumns = await Column.find({ name: "Done" }).select("_id");
      const doneIds = doneColumns.map((c) => c._id);

      const overdue = await Task.countDocuments({
        ...match,
        dueDate: { $lt: new Date() },
        columnId: { $nin: doneIds },
      });

      // Count tasks per column name (e.g. { "ToDo": 5, "In Progress": 3, "Done": 2 })
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

// PUT /api/tasks/reorder — Bulk update task positions (and optionally columns).
// Called after drag-and-drop to persist the new order to the database.
// Must be defined BEFORE /:id so Express doesn't match "reorder" as a task ID.
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

      // Build a columnId → columnName lookup for any column changes
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

      // Use bulkWrite for a single DB round-trip instead of N individual updates
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

// POST /api/tasks — Create a new task in a specific column of a dashboard
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

      // Verify the dashboard belongs to the current user
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Verify the column exists within this dashboard
      const column = await Column.findOne({
        _id: columnId,
        dashboardId,
      });
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Place the new task at the bottom of the column
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

// GET /api/tasks/:id — Get a single task with populated column and dashboard names
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

      // Only allow the task owner to view it
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

// PUT /api/tasks/:id — Update task fields (partial update)
router.put(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Destructure out immutable fields to prevent clients from overwriting them
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

      // If the task is being moved to a different column, update the denormalized columnName
      if (updates.columnId && updates.columnId !== task.columnId.toString()) {
        const newCol = await Column.findById(updates.columnId);
        if (newCol) {
          updates.columnName = newCol.name;
        }
      }

      // Auto-generate or clear assigneeId when assignedTo changes.
      // Same assignee name always gets the same ID for consistency.
      if ("assignedTo" in updates) {
        const trimmedAssignee = updates.assignedTo?.trim();
        if (trimmedAssignee) {
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
          updates.assigneeId = null;
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

// DELETE /api/tasks/:id — Delete a task (ownership verified)
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

// PUT /api/tasks/:id/move — Move a task to a different column and/or position.
// Used by drag-and-drop when moving a single task between columns.
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

      // Look up the target column name for the denormalized field
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

// PUT /api/tasks/:id/star — Toggle the starred (favorite) status of a task
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

      // Simply flip the boolean
      task.starred = !task.starred;
      await task.save();

      res.json(task);
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
