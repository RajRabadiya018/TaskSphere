"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  compactView: boolean;
  toggleCompactView: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Read saved theme from localStorage, default to dark mode
function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

// Provides theme (dark/light), sidebar toggle, and compact view toggle to the entire app.
// Theme preference is persisted in localStorage and applied via class/attribute on <html>.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [compactView, setCompactView] = useState<boolean>(false);

  // Sync the theme with the DOM and localStorage whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleCompactView = useCallback(() => {
    setCompactView((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        sidebarOpen,
        toggleSidebar,
        compactView,
        toggleCompactView,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to access theme context — throws if used outside ThemeProvider
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
