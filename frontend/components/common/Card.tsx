import React from "react";
import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme as useMuiTheme } from "@mui/material/styles";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";

  return (
    <MuiCard
      className={className}
      sx={{
        p: 0,
        overflow: "hidden",
        backdropFilter: "blur(16px)",
        background: isDark
          ? "linear-gradient(180deg, rgba(26,29,46,0.96), rgba(26,29,46,0.90))"
          : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <MuiCardContent sx={{ p: 3 }}>{children}</MuiCardContent>
    </MuiCard>
  );
};

// ---------------------------------------------------------------------------
// Stat cards used on the admin dashboard
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow";
}

const colorStyles = {
  blue: { bg: "#e8f0ff", bgDark: "#1e2a4a", fg: "#2457f5" },
  green: { bg: "#e7f8f2", bgDark: "#0f2e24", fg: "#10b981" },
  red: { bg: "#feeceb", bgDark: "#3b1616", fg: "#ef4444" },
  yellow: { bg: "#fff6df", bgDark: "#302a10", fg: "#f59e0b" },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = "blue",
}) => {
  const muiTheme = useMuiTheme();
  const isDark = muiTheme.palette.mode === "dark";
  const palette = colorStyles[color];

  return (
    <Card className="p-4">
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
            {value}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: isDark ? palette.bgDark : palette.bg,
              color: palette.fg,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
};
