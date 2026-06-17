"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/common/Loading";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">TeenVerse</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Mental Health Intelligence for Teens
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Assessment</h3>
            <p className="text-gray-600">
              Comprehensive evaluation of mental health indicators
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Prediction</h3>
            <p className="text-gray-600">
              AI-powered risk assessment with detailed explanations
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Coach</h3>
            <p className="text-gray-600">
              Personalized mental health support and guidance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
