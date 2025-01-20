import { create } from 'zustand'

export interface ScrewStatus {
  procedureNumber: number
  torque: number
  rpm: number
  angle: number
  status: number
  pset: number
  lockFlag: number
  temperature: number
  time: Date
  driveSerialNumber: number
  machineSerialNumber: number
  controlBy485: number
  startFlag: number
  screwDirection: number
}

interface Screw {
  screwStatus?: ScrewStatus
  setScrewStatus: (status?: ScrewStatus) => void
}

export const useScrewStore = create<Screw>((set) => ({
  setScrewStatus: (status?: ScrewStatus) => set({ screwStatus: status }),
}))
