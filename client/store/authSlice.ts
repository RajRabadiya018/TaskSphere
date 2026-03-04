import api from "@/lib/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    _hydrated: boolean; 
}

const initialState: AuthState = {
    user: null,
    token: null,
    status: "idle",
    error: null,
    _hydrated: false,
};

export const signupUser = createAsyncThunk(
    "auth/signup",
    async (
        data: { name: string; email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post("/auth/signup", data);
            const { user, token } = res.data;
            localStorage.setItem("token", token);
            return { user, token } as { user: AuthUser; token: string };
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const message =
                axiosErr.response?.data?.message || "Signup failed. Please try again.";
            return rejectWithValue(message);
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (
        data: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post("/auth/login", data);
            const { user, token } = res.data;
            localStorage.setItem("token", token);
            return { user, token } as { user: AuthUser; token: string };
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ message?: string }>;
            const message =
                axiosErr.response?.data?.message || "Login failed. Please try again.";
            return rejectWithValue(message);
        }
    }
);


export const loadUser = createAsyncThunk(
    "auth/loadUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/auth/me");
            return res.data.user as AuthUser;
        } catch {
            localStorage.removeItem("token");
            return rejectWithValue("Session expired");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        hydrateToken(state) {
            if (!state._hydrated) {
                const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                state.token = stored;
                state._hydrated = true;
            }
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        },
        clearAuthError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });

        builder
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });

        builder
            .addCase(loadUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(loadUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loadUser.rejected, (state) => {
                state.status = "idle";
                state.user = null;
                state.token = null;
            });
    },
});

export const { hydrateToken, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
