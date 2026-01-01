import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIRecommendation {
  breed: string;
  weight: number;
  age: string;
  currentDiet: string;
  goal: string;
  recommendedPlan: string;
  gramsPerDay: number;
  message: string;
  createdAt: string;
}

interface RecommendationState {
  recommendation: AIRecommendation | null;
  setRecommendation: (rec: AIRecommendation) => void;
  clearRecommendation: () => void;
}

export const useRecommendation = create<RecommendationState>()(
  persist(
    (set) => ({
      recommendation: null,
      setRecommendation: (recommendation) => set({ recommendation }),
      clearRecommendation: () => set({ recommendation: null }),
    }),
    {
      name: "rawpaw-recommendation",
    }
  )
);