import { postAsync } from './fetch'

export const screwing = async (id: number) => {
  await postAsync(`/api/checking/${id}/screwing`, {})
}

export const reverseScrewing = async (id: number) => {
  await postAsync(`/api/checking/${id}/reverse-screwing`, {})
}

export const syncTime = async (id: number) => {
  await postAsync(`/api/checking/${id}/sync-time`, {})
}

export const lock = async (id: number) => {
  await postAsync(`/api/checking/${id}/lock`, {})
}

export const unlock = async (id: number) => {
  await postAsync(`/api/checking/${id}/unlock`, {})
}

export const peek = async (id: number) => {
  await postAsync(`/api/checking/${id}/meter/peek`, {})
}

export const unit = async (id: number) => {
  await postAsync(`/api/checking/${id}/meter/unit`, {})
}
