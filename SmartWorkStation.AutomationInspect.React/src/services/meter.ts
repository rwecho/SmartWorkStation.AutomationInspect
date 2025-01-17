import { postAsync } from './fetch'

export const togglePeek = async (id: number) => {
  await postAsync(`/api/checking/${id}/meter/peek`, {})
}

export const toggleUnit = async (id: number) => {
  await postAsync(`/api/checking/${id}/meter/unit`, {})
}

export const reset = async (id: number) => {
  await postAsync(`/api/checking/${id}/meter/reset`, {})
}
