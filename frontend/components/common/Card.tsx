import React from "react";
import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <MuiCard
      className={className}
      sx={{
        p: 0,
        overflow: "hidden",
        backdropFilter: "blur(16px)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))",
      }}
    >
      <MuiCardContent sx={{ p: 3 }}>{children}</MuiCardContent>
    </MuiCard>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow";
}

const colorStyles = {
  blue: { bg: "#e8f0ff", fg: "#2457f5" },
  green: { bg: "#e7f8f2", fg: "#10b981" },
  red: { bg: "#feeceb", fg: "#ef4444" },
  yellow: { bg: "#fff6df", fg: "#f59e0b" },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = "blue",
}) => {
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
              backgroundColor: palette.bg,
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
