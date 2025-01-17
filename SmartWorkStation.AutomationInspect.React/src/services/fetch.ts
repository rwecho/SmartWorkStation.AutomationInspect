const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT

const combineUrls = (endpoint: string, path: string): string => {
  const endpointWithoutSlash = endpoint.endsWith('/')
    ? endpoint.slice(0, -1)
    : endpoint
  const pathWithSlash = path.startsWith('/') ? path : `/${path}`
  return `${endpointWithoutSlash}${pathWithSlash}`
}

export const fullifyUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url
  }
  return combineUrls(API_ENDPOINT, url)
}

export const getAsync = async <T>(
  url: string,
  defaultValue: T | undefined = undefined
): Promise<T | undefined> => {
  const apiUrl = combineUrls(API_ENDPOINT, url)
  const response = await fetch(apiUrl)
  const contentType = response.headers.get('content-type')
  if (response.ok) {
    // check if the response is a json
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return defaultValue
    }
  }

  // check if 40x
  if (response.status >= 400 && response.status < 500) {
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json()
      throw new Error(error.message)
    }
  }

  // check if 50x
  if (response.status >= 500) {
    throw new Error('服务器错误')
  }

  throw new Error('未知错误')
}

export const postAsync = async <T>(
  url: string,
  data: object = {}
): Promise<T | undefined> => {
  const apiUrl = combineUrls(API_ENDPOINT, url)
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const contentType = response.headers.get('content-type')
  if (response.ok) {
    // check if the response is a json
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return undefined
    }
  }

  // check if 40x
  if (response.status >= 400 && response.status < 500) {
    if (contentType && contentType.includes('application/json')) {
      const { error } = await response.json()
      throw new Error(error.message)
    }
  }

  // check if 50x
  if (response.status >= 500) {
    throw new Error('服务器错误')
  }

  throw new Error('未知错误')
}

// remove method
export const removeAsync = async (url: string): Promise<void> => {
  const apiUrl = combineUrls(API_ENDPOINT, url)
  const response = await fetch(apiUrl, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const { error } = await response.json()
      throw new Error(error.message)
    }
    throw new Error('未知错误')
  }
}

// put method
export const putAsync = async <T>(
  url: string,
  data: object
): Promise<T | undefined> => {
  const apiUrl = combineUrls(API_ENDPOINT, url)
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const contentType = response.headers.get('content-type')
  if (response.ok) {
    // check if the response is a json
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return undefined
    }
  }

  // check if 40x
  if (response.status >= 400 && response.status < 500) {
    if (contentType && contentType.includes('application/json')) {
      const { error } = await response.json()
      throw new Error(error.message)
    }
  }

  // check if 50x
  if (response.status >= 500) {
    throw new Error('服务器错误')
  }

  throw new Error('未知错误')
}
