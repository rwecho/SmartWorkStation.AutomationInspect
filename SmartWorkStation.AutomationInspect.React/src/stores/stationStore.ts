import { create } from "zustand"
import { getAsync, postAsync, putAsync, removeAsync } from "../services/fetch"

export interface Station {
  id: number
  name: string
  ip: string
  port: number
  com: string
  baudRate: number
  dataBits: number
  parity: number
  stopBits: number
  checking: boolean
  checkingPoints: number[]
  checkingTimes: number
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
  copy: (station: Station) => Promise<void>
}

export const useStationStore = create<StationStore>((set, get) => ({
  stations: [],

  load: async () => {
    const stations = await getAsync<Station[]>("/api/stations")
    set({ stations: stations })
  },

  add: async (station) => {
    const stations = get().stations
    if (stations.find((s: Station) => s.id === station.id)) {
      throw new Error("工作站ID已存在")
    }
    stations.push(station)
    await postAsync("/api/stations", {
      ...station,
      dataBits: 8,
    })
    set({ stations })
  },

  remove: async (id) => {
    const stations = get().stations.filter(
      (station: Station) => station.id !== id
    )
    await removeAsync(`/api/stations/${id}`)
    set({ stations })
  },

  update: async (station) => {
    const stations = get().stations.map((s: Station) =>
      s.id === station.id ? station : s
    )

    await putAsync<Station>(`/api/stations/${station.id}`, station)
    set({ stations })
  },

  copy: async (station) => {
    const stations = get().stations

    const newId =
      stations.reduce((max, station) => {
        return station.id > max ? station.id : max
      }, 0) + 1

    const newStation = { ...station, id: newId }
    stations.push(newStation)
    await postAsync("/api/stations", newStation)
    set({ stations })
  },
}))
