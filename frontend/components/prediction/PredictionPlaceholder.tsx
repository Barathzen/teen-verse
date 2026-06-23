"use client";

import Link from "next/link";

/**
 * Placeholder component for the Prediction section.
 * The backend currently only supports creating a single prediction for a
 * specific assessment (via `/prediction/` endpoint). Until a list endpoint is
 * added, this component provides a friendly UI prompting the user to create an
 * assessment first.
 */
export const PredictionPlaceholder: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🔮</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No predictions available
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Generate a risk prediction by creating an assessment first.
      </p>
      <Link href="/dashboard/assessment" className="inline-block">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Create Assessment
        </button>
      </Link>
    </div>
  );
};
