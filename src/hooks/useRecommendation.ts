import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIRecommendation {
  petName?: string;
  breed: string;
  weight: number;
  age: string;
  activity?: string;
  currentDiet?: string;
  goal: string;
  recommendedPlan?: string;
  recommendedProtein?: string;
  recommendedPresentation?: string;
  gramsPerDay?: number;
  dailyGrams?: number;
  monthlyGrams?: number;
  packagesPerMonth?: number;
  isPuppy?: boolean;
  product?: any;
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
