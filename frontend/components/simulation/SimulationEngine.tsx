"use client";

import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/FormElements";
import { Loading, Error } from "@/components/common/Loading";
import { simulationService, assessmentService } from "@/services/index";
import { Assessment, SimulationResponse } from "@/types/api";
import { validateHours } from "@/utils/validators";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, Pencil, Trash2, Check, X, Clock, TrendingDown, TrendingUp } from "lucide-react";

export const SimulationEngine: React.FC = () => {
  const searchParams = useSearchParams();
  const assessmentId = parseInt(searchParams.get("assessment") || "0");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulation history
  const [simulations, setSimulations] = useState<SimulationResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [editingSimId, setEditingSimId] = useState<number | null>(null);
  const [editSimName, setEditSimName] = useState("");
  const [deleteConfirmSimId, setDeleteConfirmSimId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [simulationData, setSimulationData] = useState({
    sleep_hours: 8,
    social_media_hours: 4,
    physical_activity: 5,
  });

  const [simulationName, setSimulationName] = useState("");
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await assessmentService.get(assessmentId);
        setAssessment(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  // Load simulation history
  useEffect(() => {
    const loadSimulations = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await simulationService.list();
        setSimulations(data);
      } catch (err: any) {
        // Silently fail — history is supplementary
        console.error("Failed to load simulation history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadSimulations();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateHours(simulationData.sleep_hours)) {
      errors.sleep_hours = "Must be between 0 and 24 hours";
    }

    if (!validateHours(simulationData.social_media_hours)) {
      errors.social_media_hours = "Must be between 0 and 24 hours";
    }

    if (!validateHours(simulationData.physical_activity)) {
      errors.physical_activity = "Must be between 0 and 24 hours";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulationData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsSimulating(true);
    try {
      const response = await simulationService.run({
        assessment_id: assessmentId,
        ...simulationData,
        name: simulationName,
      });
      setResult(response);
      // Refresh simulation history
      setSimulations((prev) => [response, ...prev]);
      setSimulationName("");
      setToast({ message: "Simulation completed successfully!", type: "success" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to run simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleStartRenameSim = (sim: SimulationResponse) => {
    setEditingSimId(sim.id);
    setEditSimName(sim.name || "");
  };

  const handleCancelRenameSim = () => {
    setEditingSimId(null);
    setEditSimName("");
  };

  const handleSaveRenameSim = async (id: number) => {
    try {
      await simulationService.updateName(id, editSimName);
      setSimulations((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editSimName } : s))
      );
      setEditingSimId(null);
      setEditSimName("");
      setToast({ message: "Simulation renamed successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.detail || "Failed to rename", type: "error" });
    }
  };

  const handleDeleteSim = async (id: number) => {
    try {
      await simulationService.delete(id);
      setSimulations((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirmSimId(null);
      setToast({ message: "Simulation deleted successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.detail || "Failed to delete", type: "error" });
    }
  };

  const formatSimDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <Loading message="Loading assessment..." />;

  const chartData = result
    ? [
        { name: "Current", risk: result.current_risk },
        { name: "Projected", risk: result.future_risk },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 ${
            toast.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Zap size={32} className="text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">What-If Simulation</h1>
          <p className="text-gray-600 mt-1">Explore how lifestyle changes affect mental health risk</p>
        </div>
      </div>

      {error && <Error message={error} onDismiss={() => setError(null)} />}

      {/* Show simulation form only if an assessment is selected */}
      {assessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjust Factors</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Simulation name */}
              {isAdmin && (
                <div>
                  <Input
                    label="Simulation Name (optional)"
                    name="simulation_name"
                    type="text"
                    value={simulationName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulationName(e.target.value)}
                    placeholder="e.g. Summer Lifestyle Test"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current: {assessment.sleep_hours}h
                </p>
                <Input
                  label="Sleep Hours"
                  name="sleep_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={simulationData.sleep_hours}
                  onChange={handleChange}
                  error={validationErrors.sleep_hours}
                  required
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current: {assessment.social_media_hours}h
                </p>
                <Input
                  label="Social Media Hours"
                  name="social_media_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={simulationData.social_media_hours}
                  onChange={handleChange}
                  error={validationErrors.social_media_hours}
                  required
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current: {assessment.physical_activity}h
                </p>
                <Input
                  label="Physical Activity Hours"
                  name="physical_activity"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={simulationData.physical_activity}
                  onChange={handleChange}
                  error={validationErrors.physical_activity}
                  required
                />
              </div>

              <Button
                type="submit"
                isLoading={isSimulating}
                className="w-full"
              >
                Run Simulation
              </Button>
            </form>
          </Card>

          {/* Results */}
          {result && (
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Simulation Results</h2>

              <div className="mb-8">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Current Risk</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {result.current_risk.toFixed(2)}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Projected Risk</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.future_risk.toFixed(2)}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${result.risk_reduction > 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-sm text-gray-600 mb-1">Risk Reduction</p>
                  <p className={`text-3xl font-bold ${result.risk_reduction > 0 ? "text-green-600" : "text-red-600"}`}>
                    {result.risk_reduction > 0 ? "−" : "+"}{Math.abs(result.risk_reduction).toFixed(2)}
                  </p>
                </div>
              </div>

              {result.risk_reduction > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    ✓ Great news! These changes could reduce your risk by{" "}
                    {((result.risk_reduction / result.current_risk) * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              {result.risk_reduction < 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    ⚠ These changes could increase your risk. Consider different adjustments.
                  </p>
                </div>
              )}
            </Card>
          )}

          {!result && (
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-center h-full text-center py-8">
                <div>
                  <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Adjust the factors and run a simulation
                  </h3>
                  <p className="text-gray-600">
                    See how lifestyle changes could affect your mental health risk
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        !error && (
          <Card>
            <div className="text-center py-8">
              <Zap size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No assessment selected
              </h3>
              <p className="text-gray-600 mb-4">
                Go to the Predictions page and click &quot;Run Simulation&quot; on an assessment to start.
              </p>
            </div>
          </Card>
        )
      )}

      {/* ─── Simulation History ─── */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={22} className="text-gray-500" />
          Simulation History
        </h2>

        {isLoadingHistory ? (
          <Loading message="Loading simulation history..." />
        ) : simulations.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No simulations yet</h3>
              <p className="text-gray-500 text-sm">
                Run your first simulation to see results here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {simulations.map((sim) => {
              const isEditingSim = editingSimId === sim.id;
              const isDeletingSim = deleteConfirmSimId === sim.id;

              return (
                <Card key={sim.id} className="hover:shadow-md transition duration-200 relative">
                  {/* Delete confirmation overlay */}
                  {isDeletingSim && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                      <div className="text-center space-y-4 p-6">
                        <div className="text-4xl">⚠️</div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Simulation?</h3>
                        <p className="text-sm text-gray-600 max-w-xs">
                          This will permanently remove this simulation record. This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline" onClick={() => setDeleteConfirmSimId(null)}>
                            Cancel
                          </Button>
                          <button
                            onClick={() => handleDeleteSim(sim.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-md"
                          >
                            Delete Permanently
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Name + Meta */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {isEditingSim ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editSimName}
                              onChange={(e) => setEditSimName(e.target.value)}
                              placeholder="Enter simulation name..."
                              className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRenameSim(sim.id);
                                if (e.key === "Escape") handleCancelRenameSim();
                              }}
                            />
                            <button
                              onClick={() => handleSaveRenameSim(sim.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelRenameSim}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-gray-800">
                              {sim.name || `Simulation #${sim.id}`}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              Assessment #{sim.assessment_id}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatSimDate(sim.created_at)}
                      </p>
                    </div>

                    {/* Center: Risk metrics */}
                    <div className="flex gap-4 items-center">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Current</p>
                        <p className="text-lg font-bold text-gray-900">{sim.current_risk.toFixed(1)}</p>
                      </div>
                      <div className="text-gray-300">→</div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Projected</p>
                        <p className="text-lg font-bold text-blue-600">{sim.future_risk.toFixed(1)}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        sim.risk_reduction > 0
                          ? "bg-green-50 text-green-700"
                          : sim.risk_reduction < 0
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-600"
                      }`}>
                        {sim.risk_reduction > 0 ? (
                          <TrendingDown size={12} />
                        ) : sim.risk_reduction < 0 ? (
                          <TrendingUp size={12} />
                        ) : null}
                        {sim.risk_reduction > 0 ? "−" : "+"}{Math.abs(sim.risk_reduction).toFixed(1)}
                      </div>
                    </div>

                    {/* Right: Admin controls */}
                    {isAdmin && !isEditingSim && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartRenameSim(sim)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Rename simulation"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSimId(sim.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete simulation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
