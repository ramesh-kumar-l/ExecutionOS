import { create } from "zustand";
import {
  checkAiConnection,
  getDailyBriefing,
  analyzeGoalAlignment,
  generateReflectionQuestions,
  type AiConnectionStatus,
} from "@/lib/commands/ai";
import type { AIBriefing, AIInsight } from "@/types";

interface AiState {
  isConnected: boolean;
  model: string;
  isCheckingConnection: boolean;
  briefing: AIBriefing | null;
  isLoadingBriefing: boolean;
  insights: AIInsight[];
  isLoadingInsights: boolean;
  reflectionQuestions: string[];
  isGeneratingQuestions: boolean;

  checkConnection: () => Promise<boolean>;
  loadBriefing: () => Promise<void>;
  loadInsights: () => Promise<void>;
  generateQuestions: (type: string) => Promise<void>;
  clearInsights: () => void;
}

export const useAiStore = create<AiState>((set) => ({
  isConnected: false,
  model: "llama3",
  isCheckingConnection: false,
  briefing: null,
  isLoadingBriefing: false,
  insights: [],
  isLoadingInsights: false,
  reflectionQuestions: [],
  isGeneratingQuestions: false,

  checkConnection: async () => {
    set({ isCheckingConnection: true });
    try {
      const status: AiConnectionStatus = await checkAiConnection();
      set({
        isConnected: status.connected,
        model: status.model,
        isCheckingConnection: false,
      });
      return status.connected;
    } catch {
      set({ isConnected: false, isCheckingConnection: false });
      return false;
    }
  },

  loadBriefing: async () => {
    set({ isLoadingBriefing: true });
    try {
      const briefing = await getDailyBriefing();
      set({ briefing, isLoadingBriefing: false });
    } catch {
      set({ isLoadingBriefing: false });
    }
  },

  loadInsights: async () => {
    set({ isLoadingInsights: true });
    try {
      const insights = await analyzeGoalAlignment();
      set({ insights, isLoadingInsights: false });
    } catch {
      set({ insights: [], isLoadingInsights: false });
    }
  },

  generateQuestions: async (type: string) => {
    set({ isGeneratingQuestions: true });
    try {
      const questions = await generateReflectionQuestions(type);
      set({ reflectionQuestions: questions, isGeneratingQuestions: false });
    } catch {
      set({ isGeneratingQuestions: false });
    }
  },

  clearInsights: () => set({ insights: [] }),
}));
