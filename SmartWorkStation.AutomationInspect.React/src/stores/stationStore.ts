import { create } from 'zustand'

export interface Station {
  id: number
  name: string
  ip: string
  port: number
  adjust: boolean
  checkingPoints: number[]
  checkingCount: number
  byDuration: boolean
  duration: number
  times: number
  targetTorque: number
}

interface StationStore {
  stations: Station[]
  load: () => Promise<void>
  add: (station: Station) => Promise<void>
  remove: (id: number) => Promise<void>
  update: (station: Station) => Promise<void>
}

export const useStationStore = create<StationStore>((set, get) => ({
  stations: [],

  load: async () => {
    const json = localStorage.getItem('workstations')
    if (json) {
      set({ stations: JSON.parse(json) })
    }
  },

  add: async (station) => {
    const stations = get().stations

    if (stations.find((s: Station) => s.id === station.id)) {
      throw new Error('工作站ID已存在')
    }

    stations.push(station)
    localStorage.setItem('workstations', JSON.stringify(stations))
    set({ stations })
  },

  remove: async (id) => {
    const stations = get().stations.filter(
      (station: Station) => station.id !== id
    )
    localStorage.setItem('workstations', JSON.stringify(stations))
    set({ stations })
  },

  update: async (station) => {
    const stations = get().stations.map((s: Station) =>
      s.id === station.id ? station : s
    )
    localStorage.setItem('workstations', JSON.stringify(stations))
    set({ stations })
  },
}))
