import React from "react";
import ButtonBase from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantMap: Record<ButtonVariant, "contained" | "outlined"> = {
  primary: "contained",
  secondary: "contained",
  danger: "contained",
  outline: "outlined",
};

const sizeMap: Record<ButtonSize, "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

/**
 * Explicit style map per variant — guarantees visible, high-contrast
 * button text across light and dark modes.
 */
const variantStyles: Record<ButtonVariant, Record<string, any>> = {
  primary: {
    background: "linear-gradient(135deg, #2457f5, #1737a9)",
    color: "#ffffff",
    "&:hover": {
      background: "linear-gradient(135deg, #1737a9, #102b8a)",
    },
    "&:disabled": {
      background: "linear-gradient(135deg, #93a8f4, #7b8fdb)",
      color: "rgba(255,255,255,0.7)",
    },
  },
  secondary: {
    background: "linear-gradient(135deg, #334155, #0f172a)",
    color: "#ffffff",
    "&:hover": {
      background: "linear-gradient(135deg, #1e293b, #020617)",
    },
    "&:disabled": {
      background: "linear-gradient(135deg, #64748b, #475569)",
      color: "rgba(255,255,255,0.7)",
    },
  },
  danger: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#ffffff",
    "&:hover": {
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    },
    "&:disabled": {
      background: "linear-gradient(135deg, #fca5a5, #f87171)",
      color: "rgba(255,255,255,0.7)",
    },
  },
  outline: {
    borderWidth: 2,
    borderColor: "#2457f5",
    color: "#2457f5",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(36,87,245,0.08)",
      borderColor: "#1737a9",
    },
    "&:disabled": {
      borderColor: "rgba(36,87,245,0.3)",
      color: "rgba(36,87,245,0.4)",
    },
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <ButtonBase
        ref={ref as any}
        variant={variantMap[variant]}
        size={sizeMap[size]}
        disabled={isLoading || disabled}
        disableElevation
        className={className}
        sx={{
          minWidth: "fit-content",
          fontWeight: 700,
          fontSize: size === "lg" ? "1rem" : size === "sm" ? "0.8125rem" : "0.875rem",
          letterSpacing: "0.02em",
          borderRadius: 3,
          ...variantStyles[variant],
        }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <CircularProgress size={16} color="inherit" />
            Loading...
          </span>
        ) : (
          children
        )}
      </ButtonBase>
    );
  }
);

Button.displayName = "Button";
