import { create } from 'zustand'

interface Checking {
  id: number
  status: 'pending' | 'checking' | 'done' | 'error'
  merterTorques: number[]
  screwTorques: number[]
  start: (id: number) => Promise<void>
  done: () => Promise<void>
  error: () => Promise<void>
}

export const useStationCheckingStore = create<Checking>((set) => ({
  id: 0,
  status: 'pending',

  merterTorques: [],
  screwTorques: [],

  start: async (id: number) => {
    set({ id, status: 'checking' })

    // 每隔1秒象meterTorques和screwTorques添加一条数据
    setInterval(() => {
      set((state) => {
        return {
          ...state,
          merterTorques: [
            ...state.merterTorques,
            Math.floor(Math.random() * 100),
          ],
          screwTorques: [
            ...state.screwTorques,
            Math.floor(Math.random() * 100),
          ],
        }
      })
    }, 1000)
  },

  done: async () => {
    set({ id: 0, status: 'done' })
  },

  error: async () => {
    set({ id: 0, status: 'error' })
  },
}))
