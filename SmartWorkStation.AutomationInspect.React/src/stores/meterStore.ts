import { create } from 'zustand'

export interface MeterInfo {
  model: number
  serialNumber: string
  dateOfProduct: string
  maxWarn: string
  minWarn: string
  version: string
  unitorder: number
  peek: number
}

interface Meter {
  info?: MeterInfo
  value?: number
  setInfo: (info?: MeterInfo) => void
  setValue: (value?: number) => void
}

export const useMeterStore = create<Meter>((set) => ({
  setInfo: (info) => set({ info }),
  setValue: (value) => set({ value }),
}))
