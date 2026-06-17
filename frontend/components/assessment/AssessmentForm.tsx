"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input, Select } from "@/components/common/FormElements";
import { Error } from "@/components/common/Loading";
import { assessmentService } from "@/services/index";
import { useAssessmentStore } from "@/store/assessmentStore";
import { GENDERS, PLATFORMS, SOCIAL_INTERACTION_LEVELS } from "@/utils/constants";
import { validateAge, validateHours, validateScore } from "@/utils/validators";
import { AssessmentCreate } from "@/types/api";

export const AssessmentForm: React.FC = () => {
  const router = useRouter();
  const { addAssessment } = useAssessmentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateAge(formData.age)) {
      errors.age = "Age must be between 10 and 25";
    }

    if (!validateHours(formData.social_media_hours)) {
      errors.social_media_hours = "Must be between 0 and 24 hours";
    }

    if (!validateHours(formData.sleep_hours)) {
      errors.sleep_hours = "Must be between 0 and 24 hours";
    }

    if (!validateHours(formData.screen_time_before_sleep)) {
      errors.screen_time_before_sleep = "Must be between 0 and 24 hours";
    }

    if (!validateScore(formData.academic_performance)) {
      errors.academic_performance = "Must be between 0 and 100";
    }

    if (!validateHours(formData.physical_activity)) {
      errors.physical_activity = "Must be between 0 and 24 hours";
    }

    if (!validateScore(formData.stress_level)) {
      errors.stress_level = "Must be between 0 and 100";
    }

    if (!validateScore(formData.anxiety_level)) {
      errors.anxiety_level = "Must be between 0 and 100";
    }

    if (!validateScore(formData.addiction_level)) {
      errors.addiction_level = "Must be between 0 and 100";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numValue = ["age", "social_media_hours", "sleep_hours", "screen_time_before_sleep", "academic_performance", "physical_activity", "stress_level", "anxiety_level", "addiction_level"].includes(name)
      ? parseFloat(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const assessment = await assessmentService.create(formData);
      addAssessment(assessment);
      router.push(`/dashboard/assessment?id=${assessment.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
        <p className="text-gray-600 mt-1">Complete this form to get started</p>
      </div>

      {error && <Error message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media & Screen Time</h2>
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
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sleep & Activity</h2>
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

        {/* Academic & Mental Health */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic & Mental Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Select
              label="Social Interaction Level"
              name="social_interaction_level"
              value={formData.social_interaction_level}
              onChange={handleChange}
              options={SOCIAL_INTERACTION_LEVELS.map((l) => ({ value: l.toLowerCase(), label: l }))}
              required
            />
            <Input
              label="Stress Level (0-100)"
              name="stress_level"
              type="number"
              min="0"
              max="100"
              value={formData.stress_level}
              onChange={handleChange}
              error={validationErrors.stress_level}
              required
            />
            <Input
              label="Anxiety Level (0-100)"
              name="anxiety_level"
              type="number"
              min="0"
              max="100"
              value={formData.anxiety_level}
              onChange={handleChange}
              error={validationErrors.anxiety_level}
              required
            />
            <Input
              label="Addiction Level (0-100)"
              name="addiction_level"
              type="number"
              min="0"
              max="100"
              value={formData.addiction_level}
              onChange={handleChange}
              error={validationErrors.addiction_level}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" isLoading={isLoading} className="px-8">
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
