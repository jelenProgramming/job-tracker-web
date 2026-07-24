import { useEffect, useRef, useState } from 'react'
import { api, STATUSES } from '../api'
import ApplicationForm from './ApplicationForm'
import Detail from './Detail'

const SEARCH_DEBOUNCE_MS = 250

function Funnel({ stats }) {
  if (!stats) return null
  return (
    <div className="funnel">
      {STATUSES.map((s) => (
        <div className={`funnel__cell status-bg-${s}`} key={s}>
          <div className="funnel__num">{stats.by_status[s]}</div>
          <div className="funnel__lbl">{s}</div>
        </div>
      ))}
    </div>
  )
}

export default function Applications() {
  const [apps, setApps] = useState([])
  const [companies, setCompanies] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({ status: '', company_id: '', search: '' })
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)

  // Single source of truth: the selected application is always derived from
  // the current id + the latest apps list, never duplicated into its own state.
  const selectedApp = apps.find((a) => a.id === selectedId) || null

  function refresh() {
    api.applications(filters).then(setApps).catch((e) => setError(e.message))
    api.stats().then(setStats).catch(() => {})
  }

  // Status and company are instant selects, so only the free-text search
  // needs debouncing - debouncing the dropdowns too would make them feel laggy.
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(refresh, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.company_id])

  useEffect(() => { api.companies().then(setCompanies).catch(() => {}) }, [])

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })

  return (
    <div>
      <Funnel stats={stats} />

      <div className="filterbar">
        <input className="field filterbar__search" placeholder="Search position or company..." value={filters.search} onChange={set('search')} />
        <select className="field" value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="field" value={filters.company_id} onChange={set('company_id')}>
          <option value="">All companies</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn--primary" onClick={() => { setCreating(true); setSelectedId(null) }}>+ New</button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="split">
        <div className="applist">
          {apps.length === 0 ? (
            <div className="card muted">No applications match. Add one with "+ New".</div>
          ) : apps.map((a) => (
            <button
              key={a.id}
              className={`appcard ${selectedId === a.id && !creating ? 'appcard--on' : ''}`}
              onClick={() => { setSelectedId(a.id); setCreating(false) }}
            >
              <span className={`appcard__bar status-bg-${a.status}`} />
              <div className="appcard__body">
                <div className="appcard__pos">{a.position}</div>
                <div className="appcard__co">{a.company?.name}</div>
              </div>
              <span className={`badge status-${a.status}`}>{a.status}</span>
            </button>
          ))}
        </div>

        <div className="splitright">
          {creating ? (
            <ApplicationForm onCreated={() => { setCreating(false); refresh() }} onCancel={() => setCreating(false)} />
          ) : selectedApp ? (
            <Detail app={selectedApp} onChanged={refresh} onDeleted={() => { setSelectedId(null); refresh() }} />
          ) : (
            <div className="panel panel--empty">Pick an application to see details and its timeline.</div>
          )}
        </div>
      </div>
    </div>
  )
}
