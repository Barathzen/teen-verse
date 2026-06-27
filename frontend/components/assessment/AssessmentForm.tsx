"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input, Select } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import { assessmentService, questionnaireService } from "@/services/index";
import { useAssessmentStore } from "@/store/assessmentStore";
import { GENDERS, PLATFORMS } from "@/utils/constants";
import { validateAge, validateHours, validateScore } from "@/utils/validators";
import { AssessmentCreate } from "@/types/api";
import { Sparkles } from "lucide-react";

export const AssessmentForm: React.FC = () => {
  const router = useRouter();
  const { addAssessment } = useAssessmentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const [formData, setFormData] = useState<AssessmentCreate>({
    age: 15,
    gender: "Male",
    social_media_hours: 4,
    platform_usage: "Instagram",
    sleep_hours: 8,
    screen_time_before_sleep: 2,
    academic_performance: 80,
    physical_activity: 5,
    stress_level: 5,
    anxiety_level: 5,
    addiction_level: 5,
    social_interaction_level: "medium",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await questionnaireService.generate();
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(""));
      } catch (err: any) {
        setError("Failed to load AI questionnaire. Please try refreshing.");
      } finally {
        setIsGenerating(false);
      }
    };
    fetchQuestions();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateAge(formData.age)) errors.age = "Age must be between 10 and 25";
    if (!validateHours(formData.social_media_hours)) errors.social_media_hours = "Must be between 0 and 24 hours";
    if (!validateHours(formData.sleep_hours)) errors.sleep_hours = "Must be between 0 and 24 hours";
    if (!validateHours(formData.screen_time_before_sleep)) errors.screen_time_before_sleep = "Must be between 0 and 24 hours";
    if (!validateScore(formData.academic_performance)) errors.academic_performance = "Must be between 0 and 100";
    if (!validateHours(formData.physical_activity)) errors.physical_activity = "Must be between 0 and 24 hours";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numValue = ["age", "social_media_hours", "sleep_hours", "screen_time_before_sleep", "academic_performance", "physical_activity"].includes(name)
      ? parseFloat(value)
      : value;

    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;
    if (answers.some((a) => !a.trim())) {
      setError("Please answer all the AI questions before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      // Analyze answers and create assessment via the AI backend route
      const response = await questionnaireService.analyze(questions, answers, formData);
      // Fetch the newly created assessment to update the store
      const newAssessment = await assessmentService.get(response.assessment_id);
      addAssessment(newAssessment);
      router.push(`/dashboard/assessment?id=${newAssessment.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Complete this form to get started</p>
      </div>

      {error && <Error message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="border-b dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              name="age"
              type="number"
              min="10"
              max="25"
              value={formData.age}
              onChange={handleChange}
              error={validationErrors.age}
              required
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={GENDERS.map((g) => ({ value: g, label: g }))}
              required
            />
          </div>
        </div>

        {/* Social Media & Screen Time */}
        <div className="border-b dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media & Screen Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Daily Social Media Hours"
              name="social_media_hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.social_media_hours}
              onChange={handleChange}
              error={validationErrors.social_media_hours}
              required
            />
            <Select
              label="Primary Platform"
              name="platform_usage"
              value={formData.platform_usage}
              onChange={handleChange}
              options={PLATFORMS.map((p) => ({ value: p, label: p }))}
              required
            />
            <Input
              label="Screen Time Before Sleep (hours)"
              name="screen_time_before_sleep"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.screen_time_before_sleep}
              onChange={handleChange}
              error={validationErrors.screen_time_before_sleep}
              required
            />
          </div>
        </div>

        {/* Sleep & Activity */}
        <div className="border-b dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sleep & Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sleep Hours Per Night"
              name="sleep_hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.sleep_hours}
              onChange={handleChange}
              error={validationErrors.sleep_hours}
              required
            />
            <Input
              label="Physical Activity Hours"
              name="physical_activity"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.physical_activity}
              onChange={handleChange}
              error={validationErrors.physical_activity}
              required
            />
          </div>
        </div>

        {/* Academic & Questionnaire */}
        <div className="border-b dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic & AI Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Academic Performance (0-100)"
              name="academic_performance"
              type="number"
              min="0"
              max="100"
              value={formData.academic_performance}
              onChange={handleChange}
              error={validationErrors.academic_performance}
              required
            />
          </div>

          {/* AI Questionnaire Section */}
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-blue-500" size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Psychological Assessment</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please answer the following questions honestly to help our AI understand your mental wellbeing, stress levels, and social interactions.
            </p>

            {isGenerating ? (
              <div className="text-center py-8 text-blue-500 animate-pulse">
                Generating personalized questions...
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {index + 1}. {question}
                    </label>
                    <textarea
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[80px] p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={isGenerating || answers.length === 0 || answers.some(a => !a.trim())}
            className="px-8"
          >
            Create Assessment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
