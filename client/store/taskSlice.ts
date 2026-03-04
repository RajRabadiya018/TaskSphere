import api from "@/lib/api";
import { Column } from "@/types/column";
import { Task } from "@/types/task";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

interface BoardState {
  columns: Column[];
  tasks: Record<string, Task[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BoardState = {
  columns: [],
  tasks: {},
  status: "idle",
  error: null,
};

function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr.response?.data?.message || fallback;
}

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

// Move a task to a new column on the server
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

export const deleteColumn = createAsyncThunk(
  "board/deleteColumn",
  async (
    { id, dashboardId }: { id: string; dashboardId: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.delete(`/columns/${id}`);
      dispatch(fetchBoard(dashboardId));
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to delete column"));
    }
  },
);

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

      const srcTasks = state.tasks[sourceColId] || [];
      const taskIndex = srcTasks.findIndex((t) => t._id === taskId);
      if (taskIndex === -1) return;

      const [task] = srcTasks.splice(taskIndex, 1);
      task.columnId = destColId;

      if (!state.tasks[destColId]) state.tasks[destColId] = [];
      state.tasks[destColId].splice(destIndex, 0, task);

      state.tasks[sourceColId].forEach((t, i) => (t.position = i));
      state.tasks[destColId].forEach((t, i) => (t.position = i));
    },
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

    builder
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        if (!state.tasks[task.columnId]) state.tasks[task.columnId] = [];
        state.tasks[task.columnId].push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });

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

    builder
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
        state.tasks[action.payload._id] = [];
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

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

    builder
      .addCase(deleteColumn.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.columns = state.columns.filter((c) => c._id !== deletedId);
        delete state.tasks[deletedId];
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder.addCase(reorderTasks.rejected, (state, action) => {
      state.error = action.payload as string;
    });

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
