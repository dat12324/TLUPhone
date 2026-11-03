import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, ''),
  withCredentials: true,
})

let accessToken = null
let refreshPromise = null
let sessionVersion = 0

export const setAccessToken = token => { sessionVersion += 1; accessToken = token }
export const getAccessToken = () => accessToken

export const refreshSession = () => {
  if (!refreshPromise) {
    const version = sessionVersion
    refreshPromise = api.post('/auth/refreshToken', undefined, { skipAuth: true })
      .then(({ data }) => {
        if (version !== sessionVersion) throw new Error('Phiên đăng nhập đã thay đổi.')
        if (typeof data.accessToken !== 'string') throw new Error('Phản hồi đăng nhập không hợp lệ.')
        accessToken = data.accessToken
        return accessToken
      })
      .catch(error => { if (version === sessionVersion) accessToken = null; throw error })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

api.interceptors.request.use(config => {
  config._sessionVersion ??= sessionVersion
  if (!config.skipAuth && accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`)
  else config.headers.delete('Authorization')
  if (config.data instanceof FormData) config.headers.set('Content-Type', undefined)
  return config
})

api.interceptors.response.use(response => response, async error => {
  if (axios.isCancel(error)) { error.name = 'AbortError'; return Promise.reject(error) }
  const request = error.config
  if (error.response?.status === 401 && request && !request.skipAuth && !request._retried &&
      accessToken && request._sessionVersion === sessionVersion) {
    request._retried = true
    // Request khác có thể đã refresh trong lúc response 401 đang về.
    if (request.headers.get('Authorization') === `Bearer ${accessToken}`) await refreshSession()
    if (request._sessionVersion !== sessionVersion) throw new Error('Phiên đăng nhập đã thay đổi.')
    return api.request(request)
  }
  error.status = error.response?.status
  error.message = error.response
    ? error.response.data?.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
    : 'Không thể kết nối Backend. Vui lòng kiểm tra server và thử lại.'
  return Promise.reject(error)
})

export default api
