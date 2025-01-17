import { getAsync, postAsync } from './fetch'

export const startChecking = async (id: number) => {
  return await postAsync(`/api/checking/${id}/start`)
}

export const finishChecking = async (id: number) => {
  return await postAsync(`/api/checking/${id}/finish`)
}

export const cancelChecking = async (id: number) => {
  return await postAsync(`/api/checking/${id}/cancel`)
}

export interface ScrewFactor {
  kp: number
  b: number
}

export const getFactor = async (id: number) => {
  return await getAsync<ScrewFactor>(`/api/checking/${id}/factor`)
}
