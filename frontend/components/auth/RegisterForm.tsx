"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import { validateEmail, validatePassword, validateName } from "@/utils/validators";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Sun, Moon } from "lucide-react";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateName(name)) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!validateEmail(email)) {
      errors.email = "Invalid email address";
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0];
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await register(name, email, password, "user");
      const currentUser = useAuthStore.getState().user;
      router.push(currentUser?.role === "admin" ? "/dashboard" : "/dashboard/assessment");
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0f1117] dark:to-[#1a1d2e] p-4 transition-colors duration-300">
      {/* Theme toggle floating button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">TeenVerse</h1>
          <p className="text-gray-600 dark:text-gray-400">Create your account</p>
        </div>

        {error && <Error message={error} onDismiss={clearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            error={validationErrors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            error={validationErrors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={validationErrors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={validationErrors.confirmPassword}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
