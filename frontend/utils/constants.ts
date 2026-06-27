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

export const PERSONA_TYPES: Record<string, {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  "Healthy Balanced": {
    label: "Healthy Balanced",
    emoji: "🌟",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    description: "Well-balanced digital habits and mental health",
  },
  "Digital Addict": {
    label: "Digital Addict",
    emoji: "📱",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-200 dark:border-red-800",
    description: "High screen time with potential impact on wellbeing",
  },
  "Academic Burnout": {
    label: "Academic Burnout",
    emoji: "📚",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800",
    description: "High academic pressure with stress indicators",
  },
  "Socially Isolated": {
    label: "Socially Isolated",
    emoji: "🏠",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    description: "Low social interaction with potential loneliness",
  },
};

export const API_TIMEOUT = 30000;
export const MAX_RETRIES = 3;
