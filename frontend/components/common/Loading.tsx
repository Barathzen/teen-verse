import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

export const Loading: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={44} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

interface ErrorProps {
  message: string;
  onDismiss?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message, onDismiss }) => {
  return (
    <Alert severity="error" onClose={onDismiss} sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
};

export const EmptyState: React.FC<{
  title: string;
  message: string;
  icon?: React.ReactNode;
}> = ({ title, message, icon }) => {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      {icon && <Box sx={{ mb: 2, color: "text.secondary" }}>{icon}</Box>}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
