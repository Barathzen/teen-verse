import React from "react";
import ButtonBase from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

const colorMap: Record<ButtonVariant, "primary" | "error" | "secondary"> = {
  primary: "primary",
  secondary: "secondary",
  danger: "error",
  outline: "primary",
};

const sizeMap: Record<ButtonSize, "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large",
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
    const muiVariant = variantMap[variant];
    const muiColor = colorMap[variant];

    return (
      <ButtonBase
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={sizeMap[size]}
        disabled={isLoading || disabled}
        disableElevation
        className={className}
        sx={{
          minWidth: "fit-content",
          fontWeight: 700,
          borderRadius: 3,
          ...(variant === "outline" && {
            borderWidth: 2,
          }),
          ...(variant === "danger" && {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            "&:hover": { background: "linear-gradient(135deg, #dc2626, #b91c1c)" },
          }),
          ...(variant === "primary" && {
            background: "linear-gradient(135deg, #2457f5, #1737a9)",
            "&:hover": { background: "linear-gradient(135deg, #1737a9, #102b8a)" },
          }),
          ...(variant === "secondary" && {
            background: "linear-gradient(135deg, #334155, #0f172a)",
            "&:hover": { background: "linear-gradient(135deg, #1e293b, #020617)" },
          }),
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
