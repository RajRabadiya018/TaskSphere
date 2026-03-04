import api from "@/lib/api";
import { Dashboard } from "@/types/dashboard";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

interface DashboardState {
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null; 
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  dashboards: [],
  activeDashboard: null,
  status: "idle",
  error: null,
};

// fetch all dashboards for user
export const fetchDashboards = createAsyncThunk(
  "dashboards/fetchDashboards",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/dashboards");
      return res.data as Dashboard[];
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to fetch dashboards",
      );
    }
  },
);

// create a new dashboard
export const createDashboard = createAsyncThunk(
  "dashboards/createDashboard",
  async (data: { name: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/dashboards", data);
      return res.data as Dashboard;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to create dashboard",
      );
    }
  },
);

//  rename a dashboard
export const renameDashboard = createAsyncThunk(
  "dashboards/renameDashboard",
  async (data: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/dashboards/${data.id}`, {
        name: data.name,
      });
      return res.data as Dashboard;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to rename dashboard",
      );
    }
  },
);

// delete a dashboard
export const deleteDashboard = createAsyncThunk(
  "dashboards/deleteDashboard",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/dashboards/${id}`);
      return id;
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosErr.response?.data?.message || "Failed to delete dashboard",
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboards",
  initialState,
  reducers: {
    setActiveDashboard(state, action: PayloadAction<Dashboard | null>) {
      state.activeDashboard = action.payload;
    },
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboards.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboards = action.payload;
      })
      .addCase(fetchDashboards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.dashboards.unshift(action.payload);
      })
      .addCase(createDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(renameDashboard.fulfilled, (state, action) => {
        const index = state.dashboards.findIndex(
          (d) => d._id === action.payload._id,
        );
        if (index !== -1) {
          state.dashboards[index] = action.payload;
        }
        if (state.activeDashboard?._id === action.payload._id) {
          state.activeDashboard = action.payload;
        }
      })
      .addCase(renameDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.dashboards = state.dashboards.filter(
          (d) => d._id !== action.payload,
        );
        if (state.activeDashboard?._id === action.payload) {
          state.activeDashboard = null;
        }
      })
      .addCase(deleteDashboard.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setActiveDashboard, clearDashboardError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
