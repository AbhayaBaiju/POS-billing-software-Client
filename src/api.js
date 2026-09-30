import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('pos_token')
  if (token) cfg.headers.Authorization = `Token ${token}`
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('pos_token')) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function errMsg(e) {
  const d = e?.response?.data
  if (!d) return e?.message || 'Something went wrong'
  if (typeof d === 'string') return d.startsWith('<') ? 'Server error. Please try again.' : d
  if (d.detail) return d.detail
  return Object.entries(d)
    .map(([k, v]) => `${k === 'non_field_errors' ? '' : k + ': '}${Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' | ')
}
