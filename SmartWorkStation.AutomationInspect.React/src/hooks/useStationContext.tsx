import React from 'react'
import { Station } from '../stores/stationStore'

export const StationContext = React.createContext<{
  station?: Station
}>({})

export const StationProvider = (props: {
  children: React.ReactNode
  station?: Station
}) => {
  return (
    <StationContext.Provider value={{ station: props.station }}>
      {props.children}
    </StationContext.Provider>
  )
}
