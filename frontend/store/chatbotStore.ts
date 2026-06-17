import { create } from "zustand";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotState {
  messages: ChatMessageItem[];
  isLoading: boolean;
  error: string | null;
  
  addMessage: (role: "user" | "assistant", content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),
  
  clearMessages: () => set({ messages: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
