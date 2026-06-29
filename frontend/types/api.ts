// API Response types
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface RoleUpdateRequest {
  role: string;
}

export interface AssessmentCreate {
  name?: string;
  age: number;
  gender: string;
  social_media_hours: number;
  platform_usage: string;
  sleep_hours: number;
  screen_time_before_sleep: number;
  academic_performance: number;
  physical_activity: number;
  stress_level: number;
  anxiety_level: number;
  addiction_level: number;
  social_interaction_level: string;
}

export interface Assessment extends AssessmentCreate {
  id: number;
  user_id: number;
  created_at: string;
  prediction?: PredictionResponse;
  persona?: PersonaResponse;
}

export interface PredictionRequest {
  assessment_id: number;
}

export interface PredictionResponse {
  id: number;
  risk_score: number;
  risk_category: string;
  predicted_label: number;
  confidence_score: number;
}

export interface ExplanationResponse {
  stress_impact: number;
  anxiety_impact: number;
  sleep_impact: number;
  social_media_impact: number;
  exercise_impact: number;
}

export interface PersonaResponse {
  cluster_id: number;
  persona_name: string;
}

export interface SimulationRequest {
  assessment_id: number;
  social_media_hours: number;
  sleep_hours: number;
  physical_activity: number;
  name?: string;
}

export interface SimulationResponse {
  id: number;
  assessment_id: number;
  name: string;
  created_by?: number;
  current_risk: number;
  future_risk: number;
  risk_reduction: number;
  modified_sleep_hours: number;
  modified_social_media_hours: number;
  modified_physical_activity: number;
  ripple_story?: string;
  created_at?: string;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface DashboardOverview {
  total_users: number;
  total_assessments: number;
  average_risk_score: number;
  high_risk_users: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface PersonaDistribution {
  persona_name: string;
  count: number;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}
