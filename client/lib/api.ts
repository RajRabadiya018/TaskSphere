import axios from "axios";

// Pre-configured Axios instance for all API calls to the Express backend.
// NEXT_PUBLIC_API_URL is set to the Render backend URL in production; falls back to localhost for dev.
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: automatically attach the JWT token (from localStorage)
// to every outgoing request's Authorization header
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

// Response interceptor: globally handle 401 (unauthorized) responses.
// Clears the invalid token and redirects to login (unless already on auth pages).
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
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
