import api from "@/lib/api";
import { Column } from "@/types/column";
import { Task } from "@/types/task";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface BoardState {
  columns: Column[];
  tasks: Record<string, Task[]>; // columnId → Task[]
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BoardState = {
  columns: [],
  tasks: {},
  status: "idle",
  error: null,
};

// ---------------------------------------------------------------------------
// Helper — extract error message from Axios
// ---------------------------------------------------------------------------
function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr.response?.data?.message || fallback;
}

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

/** GET /api/dashboards/:id/board — Fetch entire board */
export const fetchBoard = createAsyncThunk(
  "board/fetchBoard",
  async (dashboardId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/dashboards/${dashboardId}/board`);
      return res.data as {
        columns: Column[];
        tasks: Record<string, Task[]>;
      };
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to fetch board"));
    }
  },
);

/** POST /api/tasks — Create a task */
export const createTask = createAsyncThunk(
  "board/createTask",
  async (
    data: {
      columnId: string;
      dashboardId: string;
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      tags?: string[];
      assignedTo?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post("/tasks", data);
      return res.data as Task;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to create task"));
    }
  },
);

/** PUT /api/tasks/:id — Update a task */
export const editTask = createAsyncThunk(
  "board/editTask",
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      return res.data as Task;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to update task"));
    }
  },
);

/** DELETE /api/tasks/:id — Delete a task */
export const removeTask = createAsyncThunk(
  "board/removeTask",
  async (
    { id, columnId }: { id: string; columnId: string },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(`/tasks/${id}`);
      return { id, columnId };
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to delete task"));
    }
  },
);

/** PUT /api/tasks/:id/move — Move task to new column/position */
export const moveTask = createAsyncThunk(
  "board/moveTask",
  async (
    {
      id,
      columnId,
      position,
    }: { id: string; columnId: string; position: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`/tasks/${id}/move`, {
        columnId,
        position,
      });
      return res.data as Task;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to move task"));
    }
  },
);

/** PUT /api/tasks/:id/star — Toggle starred */
export const toggleStar = createAsyncThunk(
  "board/toggleStar",
  async (
    { id, columnId }: { id: string; columnId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`/tasks/${id}/star`);
      return { task: res.data as Task, columnId };
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to star task"));
    }
  },
);

/** POST /api/columns — Create column */
export const createColumn = createAsyncThunk(
  "board/createColumn",
  async (data: { dashboardId: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/columns", data);
      return res.data as Column;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to create column"));
    }
  },
);

/** PUT /api/columns/:id — Rename column */
export const renameColumn = createAsyncThunk(
  "board/renameColumn",
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/columns/${id}`, { name });
      return res.data as Column;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to rename column"));
    }
  },
);

/** DELETE /api/columns/:id — Delete custom column, then refetch board */
export const deleteColumn = createAsyncThunk(
  "board/deleteColumn",
  async (
    { id, dashboardId }: { id: string; dashboardId: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.delete(`/columns/${id}`);
      // Refetch board to get accurate state (tasks moved to ToDo on server)
      dispatch(fetchBoard(dashboardId));
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to delete column"));
    }
  },
);

/** PUT /api/columns/reorder — Persist column order */
export const reorderColumns = createAsyncThunk(
  "board/reorderColumns",
  async (columns: { id: string; position: number }[], { rejectWithValue }) => {
    try {
      await api.put("/columns/reorder", { columns });
      return columns;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to reorder columns"));
    }
  },
);

/** PUT /api/tasks/reorder — Persist task order (bulk) */
export const reorderTasks = createAsyncThunk(
  "board/reorderTasks",
  async (
    tasks: { id: string; position: number; columnId?: string }[],
    { rejectWithValue },
  ) => {
    try {
      await api.put("/tasks/reorder", { tasks });
      return tasks;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to reorder tasks"));
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    clearBoard(state) {
      state.columns = [];
      state.tasks = {};
      state.status = "idle";
      state.error = null;
    },
    clearBoardError(state) {
      state.error = null;
    },
    /** Optimistic: move task locally (used by drag-and-drop) */
    moveTaskLocal(
      state,
      action: PayloadAction<{
        taskId: string;
        sourceColId: string;
        destColId: string;
        destIndex: number;
      }>,
    ) {
      const { taskId, sourceColId, destColId, destIndex } = action.payload;

      // Remove from source column
      const srcTasks = state.tasks[sourceColId] || [];
      const taskIndex = srcTasks.findIndex((t) => t._id === taskId);
      if (taskIndex === -1) return;

      const [task] = srcTasks.splice(taskIndex, 1);
      task.columnId = destColId;

      // Insert into destination column
      if (!state.tasks[destColId]) state.tasks[destColId] = [];
      state.tasks[destColId].splice(destIndex, 0, task);

      // Update positions
      state.tasks[sourceColId].forEach((t, i) => (t.position = i));
      state.tasks[destColId].forEach((t, i) => (t.position = i));
    },
    /** Optimistic: reorder columns locally (used by drag-and-drop) */
    reorderColumnsLocal(
      state,
      action: PayloadAction<{ activeId: string; overId: string }>,
    ) {
      const { activeId, overId } = action.payload;
      const oldIndex = state.columns.findIndex((c) => c._id === activeId);
      const newIndex = state.columns.findIndex((c) => c._id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const [moved] = state.columns.splice(oldIndex, 1);
      state.columns.splice(newIndex, 0, moved);
      state.columns.forEach((c, i) => (c.position = i));
    },
  },
  extraReducers: (builder) => {
    // --- fetchBoard ---
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.columns = action.payload.columns;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // --- createTask ---
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        if (!state.tasks[task.columnId]) state.tasks[task.columnId] = [];
        state.tasks[task.columnId].push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- editTask ---
    builder
      .addCase(editTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const colTasks = state.tasks[updatedTask.columnId];
        if (colTasks) {
          const idx = colTasks.findIndex((t) => t._id === updatedTask._id);
          if (idx !== -1) colTasks[idx] = updatedTask;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- removeTask ---
    builder
      .addCase(removeTask.fulfilled, (state, action) => {
        const { id, columnId } = action.payload;
        if (state.tasks[columnId]) {
          state.tasks[columnId] = state.tasks[columnId].filter(
            (t) => t._id !== id,
          );
        }
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- toggleStar ---
    builder
      .addCase(toggleStar.fulfilled, (state, action) => {
        const { task, columnId } = action.payload;
        const colTasks = state.tasks[columnId];
        if (colTasks) {
          const idx = colTasks.findIndex((t) => t._id === task._id);
          if (idx !== -1) colTasks[idx] = task;
        }
      })
      .addCase(toggleStar.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- createColumn ---
    builder
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
        state.tasks[action.payload._id] = [];
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- renameColumn ---
    builder
      .addCase(renameColumn.fulfilled, (state, action) => {
        const idx = state.columns.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (idx !== -1) state.columns[idx] = action.payload;
      })
      .addCase(renameColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- deleteColumn ---
    builder
      .addCase(deleteColumn.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.columns = state.columns.filter((c) => c._id !== deletedId);
        delete state.tasks[deletedId];
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // --- reorderTasks (failure = out-of-sync, error is set) ---
    builder.addCase(reorderTasks.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // --- reorderColumns (failure = out-of-sync, error is set) ---
    builder.addCase(reorderColumns.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const {
  clearBoard,
  clearBoardError,
  moveTaskLocal,
  reorderColumnsLocal,
} = boardSlice.actions;
export default boardSlice.reducer;
