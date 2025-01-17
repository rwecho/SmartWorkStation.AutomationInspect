import { create } from 'zustand'

export enum CheckingStatus {
  idle,
  checking,
  calibrated,
  aging,
  finished,
  error,
}

export interface PointItem {
  Point: number
  Index: number
  ScrewTorque: number
  MeterTorque: number
}

export interface AgingItem {
  Index: number
  ScrewTorque: number
  MeterTorque: number
}

interface Checking {
  status: CheckingStatus
  pointItems: PointItem[]
  agingItems: AgingItem[]

  setStatus: (status: CheckingStatus) => void
  addPointItem: (pointItem: PointItem) => void
  addAgingItem: (agingItem: AgingItem) => void
}

export const useCheckingStore = create<Checking>((set) => ({
  status: CheckingStatus.idle,
  setStatus: (status) => set({ status }),
  pointItems: [],
  addPointItem: (pointItem) => {
    if (pointItem) {
      set((state) => ({ pointItems: [...state.pointItems, pointItem] }))
    }
  },
  agingItems: [],
  addAgingItem: (agingItem) => {
    if (agingItem) {
      set((state) => ({ agingItems: [...state.agingItems, agingItem] }))
    }
  },
}))
