import api from "@/lib/api";
import { TaskListItem, TaskStats } from "@/types/task";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export interface TaskFilters {
  search: string;
  priority: string[];
  status: string[];
  dashboardId: string;
}

interface TaskListState {
  tasks: TaskListItem[];
  selectedTask: TaskListItem | null;
  filters: TaskFilters;
  stats: TaskStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TaskListState = {
  tasks: [],
  selectedTask: null,
  filters: {
    search: "",
    priority: [],
    status: [],
    dashboardId: "",
  },
  stats: null,
  status: "idle",
  error: null,
};

function extractError(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return axiosErr.response?.data?.message || fallback;
}

export const fetchAllTasks = createAsyncThunk(
  "taskList/fetchAllTasks",
  async (filters: Partial<TaskFilters> | undefined, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.priority && filters.priority.length > 0)
        params.priority = filters.priority.join(",");
      if (filters?.status && filters.status.length > 0)
        params.status = filters.status.join(",");
      if (filters?.dashboardId) params.dashboardId = filters.dashboardId;

      const res = await api.get("/tasks", { params });
      return res.data as TaskListItem[];
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to fetch tasks"));
    }
  },
);

export const fetchTaskStats = createAsyncThunk(
  "taskList/fetchTaskStats",
  async (dashboardId: string | undefined, { rejectWithValue }) => {
    try {
      const params: Record<string, string> = {};
      if (dashboardId) params.dashboardId = dashboardId;

      const res = await api.get("/tasks/stats", { params });
      return res.data as TaskStats;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to fetch task stats"));
    }
  },
);

export const fetchTaskById = createAsyncThunk(
  "taskList/fetchTaskById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tasks/${id}`);
      return res.data as TaskListItem;
    } catch (err) {
      return rejectWithValue(extractError(err, "Task not found"));
    }
  },
);

export const updateTaskFromList = createAsyncThunk(
  "taskList/updateTask",
  async (
    { id, updates }: { id: string; updates: Record<string, unknown> },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      const populated = await api.get(`/tasks/${id}`);
      return populated.data as TaskListItem;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to update task"));
    }
  },
);

export const deleteTaskFromList = createAsyncThunk(
  "taskList/deleteTask",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to delete task"));
    }
  },
);

export const createTaskFromList = createAsyncThunk(
  "taskList/createTask",
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
      const populated = await api.get(`/tasks/${res.data._id}`);
      return populated.data as TaskListItem;
    } catch (err) {
      return rejectWithValue(extractError(err, "Failed to create task"));
    }
  },
);

const taskListSlice = createSlice({
  name: "taskList",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        search: "",
        priority: [],
        status: [],
        dashboardId: "",
      };
    },
    setSelectedTask(state, action: PayloadAction<TaskListItem | null>) {
      state.selectedTask = action.payload;
    },
    clearTaskList(state) {
      state.tasks = [];
      state.status = "idle";
      state.error = null;
    },
    clearTaskListError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateTaskFromList.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.tasks.findIndex((t) => t._id === updated._id);
        if (idx !== -1) state.tasks[idx] = updated;
        if (state.selectedTask?._id === updated._id) {
          state.selectedTask = updated;
        }
      })
      .addCase(updateTaskFromList.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteTaskFromList.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.selectedTask?._id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTaskFromList.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(createTaskFromList.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(createTaskFromList.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedTask,
  clearTaskList,
  clearTaskListError,
} = taskListSlice.actions;
export default taskListSlice.reducer;
