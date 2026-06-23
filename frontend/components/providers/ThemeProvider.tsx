"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createTheme,
  alpha,
} from "@mui/material";

// ---------------------------------------------------------------------------
// Theme context — exposes mode + toggle to every component
// ---------------------------------------------------------------------------
type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggleTheme: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

// ---------------------------------------------------------------------------
// Shared palette values
// ---------------------------------------------------------------------------
const BRAND = {
  primary: "#2457f5",
  primaryDark: "#1737a9",
  primaryLight: "#6c8df8",
  secondary: "#ffb300",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
};

// ---------------------------------------------------------------------------
// Build MUI theme for a given mode
// ---------------------------------------------------------------------------
function buildTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND.primary,
        dark: BRAND.primaryDark,
        light: BRAND.primaryLight,
      },
      secondary: { main: BRAND.secondary },
      background: {
        default: isDark ? "#0f1117" : "#f5f7ff",
        paper: isDark ? "#1a1d2e" : "#ffffff",
      },
      success: { main: BRAND.success },
      error: { main: BRAND.error },
      warning: { main: BRAND.warning },
      text: {
        primary: isDark ? "#e8eaed" : "#1a1a2e",
        secondary: isDark ? "#9ca3af" : "#6b7280",
      },
    },
    typography: {
      fontFamily: "var(--font-chelsea-market), Inter, system-ui, sans-serif",
      h1: { fontWeight: 700, letterSpacing: "-0.04em" },
      h2: { fontWeight: 700, letterSpacing: "-0.03em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      button: { textTransform: "none", fontWeight: 700 },
    },
    shape: { borderRadius: 18 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? "radial-gradient(circle at top left, rgba(36,87,245,0.06), transparent 30%), radial-gradient(circle at top right, rgba(255,179,0,0.04), transparent 24%), #0f1117"
              : "radial-gradient(circle at top left, rgba(36,87,245,0.10), transparent 30%), radial-gradient(circle at top right, rgba(255,179,0,0.10), transparent 24%), #f5f7ff",
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: "none",
            paddingInline: 18,
            paddingBlock: 10,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            border: `1px solid ${alpha(BRAND.primary, isDark ? 0.18 : 0.12)}`,
            boxShadow: isDark
              ? "0 16px 50px rgba(0, 0, 0, 0.3)"
              : "0 16px 50px rgba(15, 23, 42, 0.06)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              ...(isDark && {
                "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              }),
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...(isDark && {
              backgroundColor: "#1a1d2e",
              backgroundImage: "none",
            }),
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------
const STORAGE_KEY = "teenverse-theme";

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === "dark" || saved === "light") {
      setMode(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
    }
    setMounted(true);
  }, []);

  // Sync class on <html> for Tailwind dark mode + persist
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, mounted]);

  const toggleTheme = useCallback(
    () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    []
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const ctx = useMemo<ThemeContextValue>(
    () => ({ mode, toggleTheme, isDark: mode === "dark" }),
    [mode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={ctx}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
