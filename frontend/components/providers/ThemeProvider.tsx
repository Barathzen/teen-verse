"use client";

import { CssBaseline, ThemeProvider, createTheme, alpha } from "@mui/material";
import type { ReactNode } from "react";

const teenVerseTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2457f5",
      dark: "#1737a9",
      light: "#6c8df8",
    },
    secondary: {
      main: "#ffb300",
    },
    background: {
      default: "#f5f7ff",
      paper: "#ffffff",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
  },
  typography: {
    fontFamily: "var(--font-chelsea-market), Inter, system-ui, sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(36,87,245,0.10), transparent 30%), radial-gradient(circle at top right, rgba(255,179,0,0.10), transparent 24%), #f5f7ff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
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
          border: `1px solid ${alpha("#2457f5", 0.12)}`,
          boxShadow: "0 16px 50px rgba(15, 23, 42, 0.06)",
        },
      },
    },
  },
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={teenVerseTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
