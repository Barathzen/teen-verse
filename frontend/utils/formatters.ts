// Format utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRiskScore = (score: number): string => {
  return score.toFixed(2);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const getRiskCategory = (score: number): string => {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "critical";
};

export const formatErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unexpected error occurred";
};
