import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CoverageState {
  isConfirmed: boolean;
  zoneName: string | null;
  address: string | null;
  deliveryFee: number;
  setCoverage: (zone: string, address: string, fee: number) => void;
  clearCoverage: () => void;
}

export const useCoverage = create<CoverageState>()(
  persist(
    (set) => ({
      isConfirmed: false,
      zoneName: null,
      address: null,
      deliveryFee: 0,
      setCoverage: (zoneName, address, deliveryFee) =>
        set({ isConfirmed: true, zoneName, address, deliveryFee }),
      clearCoverage: () =>
        set({ isConfirmed: false, zoneName: null, address: null, deliveryFee: 0 }),
    }),
    {
      name: "rawpaw-coverage",
    }
  )
);