"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Loading } from "@/components/common/Loading";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0f1117] dark:to-[#1a1d2e] transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-[#1a1d2e] shadow-sm dark:shadow-black/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TeenVerse</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/login"
              className="inline-block px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Mental Health Intelligence for Teens
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          TeenVerse uses advanced AI to assess and monitor adolescent mental health,
          providing personalized recommendations and support.
        </p>

        <div className="space-x-4">
          <Link href="/register">
            <Button size="lg">Start Free</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#1a1d2e] rounded-lg p-8 shadow-sm dark:shadow-black/20 transition-colors duration-300">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart Assessment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive evaluation of mental health indicators
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1d2e] rounded-lg p-8 shadow-sm dark:shadow-black/20 transition-colors duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Risk Prediction</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered risk assessment with detailed explanations
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1d2e] rounded-lg p-8 shadow-sm dark:shadow-black/20 transition-colors duration-300">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Coach</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized mental health support and guidance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
