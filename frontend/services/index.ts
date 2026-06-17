import { apiClient } from "./api";
import { 
  Assessment, 
  AssessmentCreate, 
  PredictionResponse,
  ExplanationResponse,
  PersonaResponse,
  SimulationRequest,
  SimulationResponse,
  DashboardOverview,
  RiskDistribution,
  PersonaDistribution,
  ChatResponse
} from "@/types/api";

// Assessment endpoints
export const assessmentService = {
  async create(data: AssessmentCreate): Promise<Assessment> {
    const response = await apiClient.post<Assessment>("/assessment/", data);
    return response.data;
  },

  async get(id: number): Promise<Assessment> {
    const response = await apiClient.get<Assessment>(`/assessment/${id}`);
    return response.data;
  },

  async list(): Promise<Assessment[]> {
    const response = await apiClient.get<Assessment[]>("/assessment/");
    return response.data;
  },

  async updateName(id: number, name: string): Promise<Assessment> {
    const response = await apiClient.patch<Assessment>(`/assessment/${id}`, { name });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/assessment/${id}`);
  },
};

// Prediction endpoints
export const predictionService = {
  async create(assessmentId: number): Promise<PredictionResponse> {
    const response = await apiClient.post<PredictionResponse>("/prediction/", {
      assessment_id: assessmentId,
    });
    return response.data;
  },

  async get(id: number): Promise<PredictionResponse> {
    const response = await apiClient.get<PredictionResponse>(`/prediction/${id}`);
    return response.data;
  },

  async getExplanation(id: number): Promise<ExplanationResponse> {
    const response = await apiClient.get<ExplanationResponse>(
      `/prediction/${id}/explain`
    );
    return response.data;
  },
};

// Persona endpoints
export const personaService = {
  async get(assessmentId: number): Promise<PersonaResponse> {
    const response = await apiClient.get<PersonaResponse>(
      `/persona/${assessmentId}`
    );
    return response.data;
  },
};

// Simulation endpoints
export const simulationService = {
  async run(data: SimulationRequest): Promise<SimulationResponse> {
    const response = await apiClient.post<SimulationResponse>(
      "/simulation/",
      data
    );
    return response.data;
  },

  async list(): Promise<SimulationResponse[]> {
    const response = await apiClient.get<SimulationResponse[]>("/simulation/");
    return response.data;
  },

  async updateName(id: number, name: string): Promise<SimulationResponse> {
    const response = await apiClient.patch<SimulationResponse>(`/simulation/${id}`, { name });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/simulation/${id}`);
  },
};

// Chatbot endpoints
export const chatbotService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>("/chatbot/", {
      message,
    });
    return response.data;
  },
};

// Analytics endpoints
export const analyticsService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<DashboardOverview>(
      "/analytics/overview"
    );
    return response.data;
  },

  async getRiskDistribution(): Promise<RiskDistribution> {
    const response = await apiClient.get<RiskDistribution>(
      "/analytics/risk-distribution"
    );
    return response.data;
  },

  async getPersonaDistribution(): Promise<PersonaDistribution[]> {
    const response = await apiClient.get<PersonaDistribution[]>(
      "/analytics/persona-distribution"
    );
    return response.data;
  },
};
