"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Loading, Error } from "@/components/common/Loading";
import { PredictionPlaceholder } from "@/components/prediction/PredictionPlaceholder";
import { useAuth } from "@/hooks/useAuth";
import { assessmentService } from "@/services/index";
import { Assessment } from "@/types/api";
import { formatDate, getRiskCategory, formatRiskScore } from "@/utils/formatters";
import { RISK_CATEGORIES } from "@/utils/constants";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function PredictionPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assessmentService.list();
      setAssessments(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load risk predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRename = (assessment: Assessment) => {
    setEditingId(assessment.id);
    setEditName(assessment.name || "");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveRename = async (id: number) => {
    try {
      await assessmentService.updateName(id, editName);
      setAssessments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, name: editName } : a))
      );
      setEditingId(null);
      setEditName("");
      setToast({ message: "Assessment renamed successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.detail || "Failed to rename", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assessmentService.delete(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirmId(null);
      setToast({ message: "Assessment deleted successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.detail || "Failed to delete", type: "error" });
    }
  };

  if (isLoading) return <Loading message="Loading predictions..." />;
  if (error) return <Error message={error} />;

  if (assessments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Risk Predictions</h1>
            <p className="text-gray-600 mt-1">View and manage your risk assessments</p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/assessment">
              <Button>New Assessment</Button>
            </Link>
          )}
        </div>
        <Card>
          <PredictionPlaceholder />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 animate-slide-in ${
            toast.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Risk Predictions</h1>
          <p className="text-gray-600 mt-1">View and manage your risk assessments</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/assessment">
            <Button>New Assessment</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assessments.map((assessment) => {
          const prediction = assessment.prediction;
          const riskCategory = prediction ? getRiskCategory(prediction.risk_score) : null;
          const riskCategoryInfo = riskCategory ? RISK_CATEGORIES[riskCategory] : null;
          const isEditing = editingId === assessment.id;
          const isDeleting = deleteConfirmId === assessment.id;

          return (
            <Card key={assessment.id} className="hover:shadow-md transition duration-200 relative">
              {/* Delete confirmation overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4 p-6">
                    <div className="text-4xl">⚠️</div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Assessment?</h3>
                    <p className="text-sm text-gray-600 max-w-xs">
                      This will permanently delete this assessment and all related predictions. This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </Button>
                      <button
                        onClick={() => handleDelete(assessment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-md"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {/* Editable name */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter assessment name..."
                          className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(assessment.id);
                            if (e.key === "Escape") handleCancelRename();
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(assessment.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-gray-800">
                          {assessment.name || `Assessment #${assessment.id}`}
                        </span>
                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                          ID: #{assessment.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          Created {formatDate(assessment.created_at)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Demographics</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assessment.age} y/o • {assessment.gender}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Social Platform</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assessment.platform_usage}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Social Media Hours</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assessment.social_media_hours}h/day
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Academic Performance</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assessment.academic_performance}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:border-l md:pl-6 min-w-[240px]">
                  {prediction ? (
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Risk Level</p>
                      <div className="flex items-baseline gap-2 justify-center sm:justify-start mt-0.5">
                        <span className={`text-xl font-bold ${riskCategoryInfo?.color}`}>
                          {formatRiskScore(prediction.risk_score)}
                        </span>
                        <span className="text-xs text-gray-400">/ 100</span>
                      </div>
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${riskCategoryInfo?.bgColor} ${riskCategoryInfo?.color}`}>
                        {riskCategoryInfo?.label}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Risk Level</p>
                      <p className="text-sm font-semibold text-gray-500 mt-1 italic">
                        Not Generated
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 justify-center">
                    <Link href={`/dashboard/assessment/${assessment.id}`}>
                      <Button variant={prediction ? "secondary" : "primary"} className="w-full whitespace-nowrap">
                        {prediction ? "View Analysis" : (isAdmin ? "Generate Prediction" : "View Assessment")}
                      </Button>
                    </Link>
                    
                    {/* Admin controls */}
                    {isAdmin && !isEditing && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleStartRename(assessment)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Rename assessment"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(assessment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete assessment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
