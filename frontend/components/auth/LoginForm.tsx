"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Sun, Moon } from "lucide-react";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
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
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        {error && <Error message={error} onDismiss={clearError} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};
