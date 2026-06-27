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
  "Mindful Achiever": {
    label: "Mindful Achiever",
    emoji: "🌟",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    description: "Well-balanced digital habits with low stress",
  },
  "Zen Surfer": {
    label: "Zen Surfer",
    emoji: "🧘",
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
    borderColor: "border-teal-200 dark:border-teal-800",
    description: "Maintains balance despite elevated stress levels",
  },
  "Midnight Scroller": {
    label: "Midnight Scroller",
    emoji: "🦉",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "High screen time heavily impacting sleep schedule",
  },
  "Social Media Junkie": {
    label: "Social Media Junkie",
    emoji: "📱",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/40",
    borderColor: "border-pink-200 dark:border-pink-800",
    description: "Excessive platform usage affecting daily routine",
  },
  "Overworked Scholar": {
    label: "Overworked Scholar",
    emoji: "🎓",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800",
    description: "High academic performance masking severe burnout",
  },
  "Stressed Student": {
    label: "Stressed Student",
    emoji: "📚",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "Academic pressure causing significant mental strain",
  },
  "Silent Observer": {
    label: "Silent Observer",
    emoji: "👁️",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    description: "Socially withdrawn with high social anxiety",
  },
  "Lone Wolf": {
    label: "Lone Wolf",
    emoji: "🐺",
    color: "text-slate-700 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/40",
    borderColor: "border-slate-200 dark:border-slate-800",
    description: "Independent but disconnected from peer groups",
  }
};

export const API_TIMEOUT = 30000;
export const MAX_RETRIES = 3;
