"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Loading, Error } from "@/components/common/Loading";
import { assessmentService, predictionService, personaService } from "@/services/index";
import { Assessment, PredictionResponse, PersonaResponse, ExplanationResponse } from "@/types/api";
import { formatDate, getRiskCategory, formatRiskScore } from "@/utils/formatters";
import { RISK_CATEGORIES } from "@/utils/constants";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AssessmentDetail: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = parseInt(searchParams.get("id") || "", 10);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [persona, setPersona] = useState<PersonaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPrediction, setIsCreatingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentList, setAssessmentList] = useState<Assessment[]>([]);

  useEffect(() => {
    if (!Number.isFinite(assessmentId)) {
      const loadAssessments = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await assessmentService.list();
          setAssessmentList(data);
        } catch (err: any) {
          setError(err?.response?.data?.detail || "Failed to load assessments");
        } finally {
          setIsLoading(false);
        }
      };

      loadAssessments();
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const assessmentData = await assessmentService.get(assessmentId);
        setAssessment(assessmentData);
        if (assessmentData.prediction) {
          setPrediction(assessmentData.prediction);
          
          // Fetch explanation and persona in parallel
          const [explanationData, personaData] = await Promise.allSettled([
            predictionService.getExplanation(assessmentData.prediction.id),
            personaService.get(assessmentId)
          ]);
          
          if (explanationData.status === "fulfilled") {
            setExplanation(explanationData.value);
          }
          if (personaData.status === "fulfilled") {
            setPersona(personaData.value);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [assessmentId]);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleCreatePrediction = async () => {
    setIsCreatingPrediction(true);
    setError(null);
    try {
      const predictionData = await predictionService.create(assessmentId);
      setPrediction(predictionData);

      // Get explanation using predictionData.id
      const explanationData = await predictionService.getExplanation(predictionData.id);
      setExplanation(explanationData);

      // Get persona
      const personaData = await personaService.get(assessmentId);
      setPersona(personaData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create prediction");
    } finally {
      setIsCreatingPrediction(false);
    }
  };

  if (isLoading) return <Loading message="Loading assessment..." />;
  if (!Number.isFinite(assessmentId)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Pick an assessment to view its analysis</p>
        </div>

        {error && <Error message={error} onDismiss={() => setError(null)} />}

        {isLoading ? (
          <Loading message="Loading assessments..." />
        ) : assessmentList.length === 0 ? (
          <div className="space-y-6">
            <Card>
              <div className="text-center py-10">
                <p className="text-gray-600">No assessments found yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create your first assessment below to continue.
                </p>
              </div>
            </Card>
            <AssessmentForm />
          </div>
        ) : (
          <div className="grid gap-4">
            {assessmentList.map((item) => (
              <Card key={item.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Assessment #{item.id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Age {item.age}, {item.gender}, {item.platform_usage}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {formatDate(item.created_at)}
                    </p>
                  </div>
                  <Button onClick={() => router.push(`/dashboard/assessment?id=${item.id}`)}>
                    View Analysis
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!assessment) return <Error message="Assessment not found" />;

  const riskCategory = prediction ? getRiskCategory(prediction.risk_score) : null;
  const riskCategoryInfo = riskCategory ? RISK_CATEGORIES[riskCategory] : null;

  const chartData = explanation
    ? [
        { name: "Stress", value: Math.abs(explanation.stress_impact) },
        { name: "Anxiety", value: Math.abs(explanation.anxiety_impact) },
        { name: "Sleep", value: Math.abs(explanation.sleep_impact) },
        { name: "Social Media", value: Math.abs(explanation.social_media_impact) },
        { name: "Exercise", value: Math.abs(explanation.exercise_impact) },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Details</h1>
          <p className="text-gray-600 mt-1">Created {formatDate(assessment.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={`/dashboard/simulation?assessment=${assessmentId}`}>
              <Button variant="secondary">Run Simulation</Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {error && <Error message={error} onDismiss={() => setError(null)} />}

      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="text-xl font-semibold text-gray-900">{assessment.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="text-xl font-semibold text-gray-900">{assessment.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Platform</p>
            <p className="text-xl font-semibold text-gray-900">{assessment.platform_usage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Academic Performance</p>
            <p className="text-xl font-semibold text-gray-900">{assessment.academic_performance}%</p>
          </div>
        </div>
      </Card>

      {/* Habits & Health */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Habits & Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Social Media Hours</p>
            <p className="text-2xl font-bold text-gray-900">{assessment.social_media_hours}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Sleep Hours</p>
            <p className="text-2xl font-bold text-gray-900">{assessment.sleep_hours}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Physical Activity</p>
            <p className="text-2xl font-bold text-gray-900">{assessment.physical_activity}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Screen Time Before Sleep</p>
            <p className="text-2xl font-bold text-gray-900">{assessment.screen_time_before_sleep}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Stress Level</p>
            <p className="text-2xl font-bold text-gray-900">{assessment.stress_level}/100</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Social Interaction</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{assessment.social_interaction_level}</p>
          </div>
        </div>
      </Card>

      {/* Mental Health Indicators */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mental Health Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Anxiety Level</p>
            <p className="text-2xl font-bold text-blue-600">{assessment.anxiety_level}/100</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Addiction Level</p>
            <p className="text-2xl font-bold text-purple-600">{assessment.addiction_level}/100</p>
          </div>
        </div>
      </Card>

      {/* Prediction Results */}
      {!prediction ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">
              {isAdmin
                ? "Generate a risk prediction for this assessment"
                : "No prediction has been generated for this assessment yet."}
            </p>
            {isAdmin && (
              <Button
                className="mt-4"
                isLoading={isCreatingPrediction}
                onClick={handleCreatePrediction}
              >
                Generate Prediction
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Card className={riskCategoryInfo?.bgColor}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Prediction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-2">Risk Score</p>
                <p className={`text-5xl font-bold ${riskCategoryInfo?.color}`}>
                  {formatRiskScore(prediction.risk_score)}
                </p>
                <p className={`text-lg font-semibold mt-2 ${riskCategoryInfo?.color}`}>
                  {riskCategoryInfo?.label}
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Confidence Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(prediction.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Predicted Label</p>
                  <p className="text-3xl font-bold text-gray-900">{prediction.predicted_label}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Factor Impact Analysis */}
          {explanation && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Factor Impact Analysis</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Persona */}
          {persona && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Persona Classification</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎭</div>
                <div>
                  <p className="text-sm text-gray-600">Persona</p>
                  <p className="text-2xl font-bold text-gray-900">{persona.persona_name}</p>
                  <p className="text-sm text-gray-600 mt-1">Cluster ID: {persona.cluster_id}</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
