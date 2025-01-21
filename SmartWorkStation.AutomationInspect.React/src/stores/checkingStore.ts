import { create } from 'zustand'
import { fullifyUrl } from '../services/fetch'

export enum CheckingStatus {
  idle = 0,
  checking = 1,
  calibrated = 2,
  aging = 3,
  finished = 4,
  error = 5,
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
}

export const useCheckingStore = create<Checking>((set) => ({
  status: CheckingStatus.idle,
}))
