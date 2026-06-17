// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain an uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain a lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain a number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateAge = (age: number): boolean => {
  return age >= 10 && age <= 25;
};

export const validateHours = (hours: number): boolean => {
  return hours >= 0 && hours <= 24;
};

export const validateScore = (score: number): boolean => {
  return score >= 0 && score <= 100;
};
