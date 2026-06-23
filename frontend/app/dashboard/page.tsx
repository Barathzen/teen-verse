"use client";

import { useEffect, useState } from "react";
import { Card, StatCard } from "@/components/common/Card";
import { Loading, Error } from "@/components/common/Loading";
import { analyticsService } from "@/services/index";
import { DashboardOverview, RiskDistribution, PersonaDistribution } from "@/types/api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Users, TrendingUp, AlertCircle, Activity } from "lucide-react";

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [personaDistribution, setPersonaDistribution] = useState<PersonaDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [overviewData, riskData, personaData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getRiskDistribution(),
          analyticsService.getPersonaDistribution(),
        ]);

        setOverview(overviewData);
        setRiskDistribution(riskData);
        setPersonaDistribution(personaData);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <Loading message="Loading dashboard..." />;

  const riskChartData = riskDistribution
    ? [
        { name: "Low Risk", value: riskDistribution.low },
        { name: "Medium Risk", value: riskDistribution.medium },
        { name: "High Risk", value: riskDistribution.high },
        { name: "Critical Risk", value: riskDistribution.critical },
      ]
    : [];

  const COLORS = ["#10b981", "#f59e0b", "#ef7f5b", "#ef4444"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back to TeenVerse</p>
        </div>
        <Link href="/dashboard/assessment">
          <Button>New Assessment</Button>
        </Link>
      </div>

      {error && <Error message={error} />}

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Users"
            value={overview.total_users}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatCard
            label="Assessments"
            value={overview.total_assessments}
            icon={<Activity size={24} />}
            color="green"
          />
          <StatCard
            label="Avg Risk Score"
            value={overview.average_risk_score.toFixed(2)}
            icon={<TrendingUp size={24} />}
            color="yellow"
          />
          <StatCard
            label="High Risk Users"
            value={overview.high_risk_users}
            icon={<AlertCircle size={24} />}
            color="red"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution */}
        {riskDistribution && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} />
                <YAxis tick={{ fill: "currentColor", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid var(--tooltip-border, #e5e7eb)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Persona Distribution */}
        {personaDistribution.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Persona Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={personaDistribution}
                  dataKey="count"
                  nameKey="persona_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/assessment">
            <Button variant="outline" className="w-full">
              Create Assessment
            </Button>
          </Link>
          <Link href="/dashboard/prediction">
            <Button variant="outline" className="w-full">
              View Predictions
            </Button>
          </Link>
          <Link href="/dashboard/chatbot">
            <Button variant="outline" className="w-full">
              Talk to Coach
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
