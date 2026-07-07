import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({ name: '', website: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = () => api.companies().then(setCompanies).catch((e) => setError(e.message))
  useEffect(load, [])

  async function add(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    try { await api.createCompany(form); setForm({ name: '', website: '' }); load() }
    catch (err) { setError(err.message) }
  }
  async function remove(id) {
    if (!confirm('Delete this company and all its applications?')) return
    await api.deleteCompany(id); load()
  }

  return (
    <div>
      <form className="card" onSubmit={add}>
        <h2 className="card__title">Add a company</h2>
        <div className="grid2">
          <input className="field" placeholder="Company name *" value={form.name} onChange={set('name')} />
          <input className="field" placeholder="Website (optional)" value={form.website} onChange={set('website')} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn--primary" type="submit">Add company</button>
      </form>
      <div className="card">
        <h2 className="card__title">Your companies</h2>
        {companies.length === 0 ? <p className="muted">No companies yet.</p> : (
          <ul className="plain">
            {companies.map((c) => (
              <li key={c.id} className="lrow">
                <div>
                  <div className="lrow__name">{c.name}</div>
                  <div className="lrow__sub">{c.website || 'no website'} | {c.applications_count} applications</div>
                </div>
                <button className="xdel" onClick={() => remove(c.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
