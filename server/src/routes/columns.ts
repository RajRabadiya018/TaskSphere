import { NextFunction, Response, Router } from "express";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

const router = Router();

router.use(auth);

// PUT /api/columns/reorder — Bulk update column positions.
// Must be defined BEFORE /:id so Express doesn't match "reorder" as a column ID.
router.put(
  "/reorder",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { columns } = req.body;

      if (!Array.isArray(columns) || columns.length === 0) {
        res.status(400).json({
          message: "columns array is required with [{ id, position }]",
        });
        return;
      }

      // Use bulkWrite for efficient batch updates instead of multiple individual queries
      const bulkOps = columns.map((col: { id: string; position: number }) => ({
        updateOne: {
          filter: { _id: col.id },
          update: { position: col.position },
        },
      }));

      await Column.bulkWrite(bulkOps);

      res.json({ message: "Columns reordered successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

// POST /api/columns — Create a new custom column in a dashboard
router.post(
  "/",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { dashboardId, name } = req.body;

      if (!dashboardId || !name || !name.trim()) {
        res.status(400).json({
          message: "Dashboard ID and column name are required",
        });
        return;
      }

      // Verify the dashboard belongs to the authenticated user
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Place the new column at the end by finding the current highest position
      const maxPosCol = await Column.findOne({ dashboardId }).sort({
        position: -1,
      });
      const nextPosition = maxPosCol ? maxPosCol.position + 1 : 0;

      const column = await Column.create({
        dashboardId,
        name: name.trim(),
        type: "custom",
        position: nextPosition,
      });

      res.status(201).json(column);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// PUT /api/columns/:id — Rename a column and sync the columnName on all its tasks
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
        res.status(400).json({ message: "Column name is required" });
        return;
      }

      const column = await Column.findById(req.params.id);
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Verify ownership through the parent dashboard
      const dashboard = await Dashboard.findOne({
        _id: column.dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      column.name = name.trim();
      await column.save();

      // Keep the denormalized columnName field on tasks in sync with the column name
      await Task.updateMany(
        { columnId: column._id },
        { columnName: column.name },
      );

      res.json(column);
    } catch (error: unknown) {
      next(error);
    }
  },
);

// DELETE /api/columns/:id — Delete a custom column.
// Default columns (ToDo, In Progress, Done) cannot be deleted.
// Tasks in the deleted column are moved to the first default column (ToDo).
router.delete(
  "/:id",
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const column = await Column.findById(req.params.id);
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Prevent deletion of default columns to maintain board structure
      if (column.type === "default") {
        res.status(400).json({
          message: "Default columns cannot be deleted",
        });
        return;
      }

      const dashboard = await Dashboard.findOne({
        _id: column.dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Move orphaned tasks to the first default column so no tasks are lost
      const todoColumn = await Column.findOne({
        dashboardId: column.dashboardId,
        type: "default",
      }).sort({ position: 1 });

      if (todoColumn) {
        await Task.updateMany(
          { columnId: column._id },
          { columnId: todoColumn._id, columnName: todoColumn.name },
        );
      }

      await Column.findByIdAndDelete(req.params.id);

      res.json({ message: "Column deleted successfully" });
    } catch (error: unknown) {
      next(error);
    }
  },
);

export default router;
