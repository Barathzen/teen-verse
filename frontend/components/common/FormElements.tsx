import React from "react";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

type SharedTextFieldProps = Omit<
  TextFieldProps,
  "label" | "error" | "helperText" | "variant" | "select" | "multiline" | "children"
>;

interface InputProps extends SharedTextFieldProps {
  label?: string;
  error?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, min, max, step, ...props }, ref) => {
    // Prevent React NaN warnings if the value is NaN
    const safeValue = Number.isNaN(props.value) ? "" : props.value;

    return (
      <TextField
        {...props}
        value={safeValue}
        inputRef={ref}
        fullWidth
        label={label}
        error={Boolean(error)}
        helperText={error}
        variant="outlined"
        slotProps={{
          htmlInput: {
            min,
            max,
            step,
          },
        }}
      />
    );
  }
);

Input.displayName = "Input";

interface SelectProps extends SharedTextFieldProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLInputElement, SelectProps>(
  ({ label, error, options, ...props }, ref) => {
    return (
      <TextField
        {...props}
        inputRef={ref}
        select
        fullWidth
        label={label}
        error={Boolean(error)}
        helperText={error}
        variant="outlined"
      >
        <MenuItem value="">Select an option</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }
);

Select.displayName = "Select";

interface TextareaProps extends SharedTextFieldProps {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLInputElement, TextareaProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <TextField
        {...props}
        inputRef={ref}
        fullWidth
        multiline
        minRows={4}
        label={label}
        error={Boolean(error)}
        helperText={error}
        variant="outlined"
      />
    );
  }
);

Textarea.displayName = "Textarea";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};
