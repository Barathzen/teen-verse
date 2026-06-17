import { create } from "zustand";
import { Assessment } from "@/types/api";

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isLoading: boolean;
  error: string | null;
  
  setAssessments: (assessments: Assessment[]) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (assessment: Assessment) => void;
  removeAssessment: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessments: [],
  currentAssessment: null,
  isLoading: false,
  error: null,

  setAssessments: (assessments) => set({ assessments }),
  
  setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
  
  addAssessment: (assessment) =>
    set((state) => ({
      assessments: [...state.assessments, assessment],
    })),
  
  updateAssessment: (assessment) =>
    set((state) => ({
      assessments: state.assessments.map((a) =>
        a.id === assessment.id ? assessment : a
      ),
      currentAssessment:
        state.currentAssessment?.id === assessment.id
          ? assessment
          : state.currentAssessment,
    })),
  
  removeAssessment: (id) =>
    set((state) => ({
      assessments: state.assessments.filter((a) => a.id !== id),
      currentAssessment:
        state.currentAssessment?.id === id ? null : state.currentAssessment,
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
