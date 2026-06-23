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
import { BarChart3, PieChart as PieChartIcon, Users } from "lucide-react";

export default function AnalyticsPage() {
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
        setError(err?.response?.data?.detail || "Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <Loading message="Loading analytics..." />;

  const riskChartData = riskDistribution
    ? [
        { name: "Low", value: riskDistribution.low },
        { name: "Medium", value: riskDistribution.medium },
        { name: "High", value: riskDistribution.high },
        { name: "Critical", value: riskDistribution.critical },
      ]
    : [];

  const COLORS = ["#10b981", "#f59e0b", "#ef7f5b", "#ef4444"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Platform-wide mental health statistics</p>
      </div>

      {error && <Error message={error} />}

      {/* Overview Stats */}
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
            icon={<BarChart3 size={24} />}
            color="green"
          />
          <StatCard
            label="Avg Risk Score"
            value={overview.average_risk_score.toFixed(2)}
            icon={<PieChartIcon size={24} />}
            color="yellow"
          />
          <StatCard
            label="High Risk"
            value={overview.high_risk_users}
            icon={<Users size={24} />}
            color="red"
          />
        </div>
      )}

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution Chart */}
        {riskDistribution && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Risk Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Low</p>
                <p className="text-xl font-bold text-green-600">{riskDistribution.low}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Medium</p>
                <p className="text-xl font-bold text-yellow-600">{riskDistribution.medium}</p>
              </div>
              <div>
                <p className="text-gray-600">High</p>
                <p className="text-xl font-bold text-orange-600">{riskDistribution.high}</p>
              </div>
              <div>
                <p className="text-gray-600">Critical</p>
                <p className="text-xl font-bold text-red-600">{riskDistribution.critical}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Persona Distribution Chart */}
        {personaDistribution.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Persona Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={personaDistribution}
                  dataKey="count"
                  nameKey="persona_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={{ fontSize: 12 }}
                >
                  {COLORS.map((color, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center py-4 border dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Risk Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview?.average_risk_score.toFixed(1) || "0"}
            </p>
          </div>
          <div className="text-center py-4 border dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Assessments</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview?.total_assessments || "0"}
            </p>
          </div>
          <div className="text-center py-4 border dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">High Risk Users %</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {overview && overview.total_users > 0
                ? (((overview.high_risk_users / overview.total_users) * 100).toFixed(1))
                : "0"}
              %
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
