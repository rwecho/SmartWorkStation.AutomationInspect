import { ScrewStatus } from '../stores/screwStore'
import { getAsync, postAsync } from './fetch'

export const getScrewStatus = async (id: number) => {
  return (await getAsync(`/api/screw/${id}/status`, {})) as ScrewStatus
}

export const screwing = async (id: number) => {
  await postAsync(`/api/screw/${id}/screwing`, {})
}

export const reverseScrewing = async (id: number) => {
  await postAsync(`/api/screw/${id}/reverse-screwing`, {})
}

export const syncTime = async (id: number) => {
  await postAsync(`/api/screw/${id}/sync-time`, {})
}

export const lock = async (id: number) => {
  await postAsync(`/api/screw/${id}/lock`, {})
}

export const unlock = async (id: number) => {
  await postAsync(`/api/screw/${id}/unlock`, {})
}

export const peek = async (id: number) => {
  await postAsync(`/api/screw/${id}/meter/peek`, {})
}

export const unit = async (id: number) => {
  await postAsync(`/api/screw/${id}/meter/unit`, {})
}
