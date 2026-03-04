import { NextFunction, Response, Router } from "express";
import auth, { AuthRequest } from "../middleware/auth";
import Column from "../models/Column";
import Dashboard from "../models/Dashboard";
import Task from "../models/Task";

const router = Router();

// All routes require authentication
router.use(auth);

// ---------------------------------------------------------------------------
// PUT /api/columns/reorder — Reorder columns
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
      const { columns } = req.body;

      if (!Array.isArray(columns) || columns.length === 0) {
        res.status(400).json({
          message: "columns array is required with [{ id, position }]",
        });
        return;
      }

      // Bulk update positions
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

// ---------------------------------------------------------------------------
// POST /api/columns — Create a new column
// ---------------------------------------------------------------------------
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

      // Verify dashboard ownership
      const dashboard = await Dashboard.findOne({
        _id: dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Dashboard not found" });
        return;
      }

      // Determine next position
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

// ---------------------------------------------------------------------------
// PUT /api/columns/:id — Update column name
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
        res.status(400).json({ message: "Column name is required" });
        return;
      }

      const column = await Column.findById(req.params.id);
      if (!column) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Verify dashboard ownership
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

      // Sync columnName on all tasks in this column
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

// ---------------------------------------------------------------------------
// DELETE /api/columns/:id — Delete a custom column (move tasks to ToDo)
// ---------------------------------------------------------------------------
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

      // Only custom columns can be deleted
      if (column.type === "default") {
        res.status(400).json({
          message: "Default columns cannot be deleted",
        });
        return;
      }

      // Verify dashboard ownership
      const dashboard = await Dashboard.findOne({
        _id: column.dashboardId,
        userId: req.userId,
      });
      if (!dashboard) {
        res.status(404).json({ message: "Column not found" });
        return;
      }

      // Find the ToDo column for this dashboard (first default column)
      const todoColumn = await Column.findOne({
        dashboardId: column.dashboardId,
        type: "default",
      }).sort({ position: 1 });

      if (todoColumn) {
        // Move all tasks from the deleted column to ToDo
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
