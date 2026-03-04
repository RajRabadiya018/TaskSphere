import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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
    _hydrated: boolean; // true once token has been read from localStorage
}

// ---------------------------------------------------------------------------
// Initial State — token starts null; AuthLoader hydrates it from localStorage
// ---------------------------------------------------------------------------
const initialState: AuthState = {
    user: null,
    token: null,
    status: "idle",
    error: null,
    _hydrated: false,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/** POST /api/auth/signup */
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

/** POST /api/auth/login */
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

/** GET /api/auth/me — load the current user from a stored token */
export const loadUser = createAsyncThunk(
    "auth/loadUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/auth/me");
            return res.data.user as AuthUser;
        } catch {
            // Token invalid/expired — clear it
            localStorage.removeItem("token");
            return rejectWithValue("Session expired");
        }
    }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /** Hydrate token from localStorage (called once by AuthLoader) */
        hydrateToken(state) {
            if (!state._hydrated) {
                const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                state.token = stored;
                state._hydrated = true;
            }
        },
        /** Logout — clear user, token, and localStorage */
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        },
        /** Clear error message */
        clearAuthError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // --- signup ---
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

        // --- login ---
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

        // --- loadUser ---
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
