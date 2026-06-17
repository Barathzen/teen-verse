// Utility constants
export const GENDERS = ["Male", "Female", "Other"];

export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Snapchat",
  "Twitter",
  "Facebook",
  "Other",
];

export const SOCIAL_INTERACTION_LEVELS = ["Low", "Medium", "High"];

export const RISK_CATEGORIES: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: "Low Risk", color: "text-green-600", bgColor: "bg-green-50" },
  medium: { label: "Medium Risk", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  high: { label: "High Risk", color: "text-orange-600", bgColor: "bg-orange-50" },
  critical: { label: "Critical Risk", color: "text-red-600", bgColor: "bg-red-50" },
};

export const API_TIMEOUT = 30000;
export const MAX_RETRIES = 3;
