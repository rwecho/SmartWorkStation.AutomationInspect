import { create } from 'zustand'

interface MeterInfo {
  Model: number
  SerialNumber: string
  DateOfProduct: string
  MaxWarn: string
  MinWarn: string
  Version: string
  Unitorder: number
  Peek: number
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
