const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export const token = {
  get: () => localStorage.getItem('tracklr_token'),
  set: (t) => localStorage.setItem('tracklr_token', t),
  clear: () => localStorage.removeItem('tracklr_token'),
}

async function req(path, options = {}) {
  const t = token.get()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    token.clear()
    throw new Error('Session expired. Please log in again.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || 'Request failed')
  return body
}

const qs = (params) => {
  const s = Object.entries(params)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return s ? `?${s}` : ''
}

export const api = {
  register: (d) => req('/api/register', { method: 'POST', body: JSON.stringify(d) }),
  login: (d) => req('/api/login', { method: 'POST', body: JSON.stringify(d) }),
  logout: () => req('/api/logout', { method: 'POST' }),
  me: () => req('/api/me'),

  stats: () => req('/api/stats'),

  companies: () => req('/api/companies'),
  createCompany: (d) => req('/api/companies', { method: 'POST', body: JSON.stringify(d) }),
  deleteCompany: (id) => req(`/api/companies/${id}`, { method: 'DELETE' }),

  applications: (filters = {}) => req(`/api/applications${qs(filters)}`),
  createApplication: (d) => req('/api/applications', { method: 'POST', body: JSON.stringify(d) }),
  updateStatus: (id, status) => req(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addEvent: (id, note) => req(`/api/applications/${id}/events`, { method: 'POST', body: JSON.stringify({ note }) }),
  deleteApplication: (id) => req(`/api/applications/${id}`, { method: 'DELETE' }),
}

export const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected', 'accepted']
