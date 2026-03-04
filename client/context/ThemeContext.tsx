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

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [compactView, setCompactView] = useState<boolean>(false);

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

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
