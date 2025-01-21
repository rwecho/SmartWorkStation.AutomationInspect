import { useEffect, useState } from 'react'
import { CheckingStatus } from '../stores/checkingStore'
import { fullifyUrl } from '../services/fetch'

export interface CheckPoint {
  point: number
  index: number
  screwTorque: number
  meterTorque: number
}

export interface AgingPoint {
  index: number
  screwTorque: number
  meterTorque: number
}

export interface ScrewFactor {
  kp: number
  b: number
}

export interface RealTorque {
  screwTorque: number
  meterTorque: number
}

const useCheckStatus = (id: number) => {
  const [status, setStatus] = useState<CheckingStatus>(CheckingStatus.idle)
  const [checkingPoints, setCheckingPoints] = useState<CheckPoint[]>([])
  const [agingPoints, setAgingPoints] = useState<AgingPoint[]>([])
  const [screwFactor, setScrewFactor] = useState<ScrewFactor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [realTorque, setRealTorque] = useState<RealTorque | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(
      fullifyUrl(`/api/checking/${id}/status`)
    )
    eventSource.addEventListener('status', (event) => {
      setStatus(Number(event.data) as CheckingStatus)
    })

    eventSource.addEventListener('checking', (event) => {
      const point = JSON.parse(event.data) as CheckPoint
      setCheckingPoints((prev) => [...prev, point])

      setRealTorque({
        screwTorque: point.screwTorque,
        meterTorque: point.meterTorque,
      })
    })

    eventSource.addEventListener('calibrated', (event) => {
      const factor = JSON.parse(event.data) as ScrewFactor
      setScrewFactor(factor)
    })

    eventSource.addEventListener('aging', (event) => {
      const point = JSON.parse(event.data) as AgingPoint
      setAgingPoints((prev) => [...prev, point])
      setRealTorque({
        screwTorque: point.screwTorque,
        meterTorque: point.meterTorque,
      })
    })

    eventSource.addEventListener('finished', () => {
      setStatus(CheckingStatus.finished)
    })

    eventSource.addEventListener('onerror', (event) => {
      setError(event.data as string)
    })

    return () => {
      eventSource.close()
    }
  }, [])

  return {
    status,
    error,
    realTorque,
    checkingPoints,
    agingPoints,
    screwFactor,
  }
}

export default useCheckStatus
