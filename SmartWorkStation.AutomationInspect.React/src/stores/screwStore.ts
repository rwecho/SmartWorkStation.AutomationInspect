import { create } from 'zustand'

interface ScrewStatus {
  ProcedureNumber: number
  Torque: number
  RPM: number
  Angle: number
  Status: number
  Pset: number
  LockFlag: number
  Temperature: number
  Time: Date
  DriveSerialNumber: number
  MachineSerialNumber: number
  ControlBy485: number
  StartFlag: number
  ScrewDirection: number
}

interface Screw {
  screwStatus?: ScrewStatus
  setScrewStatus: (status?: ScrewStatus) => void
}

export const useScrewStore = create<Screw>((set) => ({
  setScrewStatus: (status?: ScrewStatus) => set({ screwStatus: status }),
}))
