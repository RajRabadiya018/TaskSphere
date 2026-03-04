import axios from "axios";

/**
 * Axios instance pre-configured for the Task Manager backend API.
 *
 * Base URL points to the Express server at http://localhost:5000/api.
 * The auth token (JWT) is attached automatically via an interceptor when
 * it exists in localStorage.
 */
const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// ---------------------------------------------------------------------------
// Request Interceptor — attach JWT token if available
// ---------------------------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response Interceptor — handle 401 globally
// ---------------------------------------------------------------------------
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear and redirect to login
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                // Only redirect if not already on login/signup page
                const path = window.location.pathname;
                if (path !== "/login" && path !== "/signup") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
