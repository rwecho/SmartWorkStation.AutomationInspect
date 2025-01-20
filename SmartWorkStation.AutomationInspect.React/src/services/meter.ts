import { MeterInfo } from '../stores/meterStore'
import { getAsync, postAsync } from './fetch'

export const getInfo = async (id: number) => {
  return (await getAsync(`/api/meter/${id}/info`)) as MeterInfo
}

export const getValue = async (id: number) => {
  return (await getAsync(`/api/meter/${id}/value`)) as number
}

export const togglePeek = async (id: number) => {
  await postAsync(`/api/meter/${id}/peek`, {})
}

export const toggleUnit = async (id: number) => {
  await postAsync(`/api/merter/${id}/unit`, {})
}

export const reset = async (id: number) => {
  await postAsync(`/api/meter/${id}/reset`, {})
}
