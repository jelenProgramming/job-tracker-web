import { useEffect, useState } from 'react'
import { api, STATUSES } from '../api'

const today = () => new Date().toISOString().slice(0, 10)

export default function ApplicationForm({ onCreated, onCancel }) {
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({
    company_id: '', position: '', status: 'wishlist',
    location: '', salary: '', link: '', applied_date: '', notes: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  useEffect(() => {
    api.companies().then((c) => {
      setCompanies(c)
      if (c.length) setForm((f) => ({ ...f, company_id: String(c[0].id) }))
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await api.createApplication({
        ...form,
        company_id: Number(form.company_id),
        applied_date: form.applied_date || null,
      })
      onCreated()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (companies.length === 0) {
    return (
      <div className="panel">
        <p className="muted">Add a company first (Companies tab), then track an application.</p>
        <button className="btn" onClick={onCancel}>Back</button>
      </div>
    )
  }

  return (
    <form className="panel" onSubmit={submit}>
      <h2 className="panel__title">New application</h2>
      <label className="lbl">Company
        <select className="field" value={form.company_id} onChange={set('company_id')}>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="lbl">Position
        <input className="field" placeholder="e.g. Junior Full-Stack Developer" value={form.position} onChange={set('position')} />
      </label>
      <div className="grid2">
        <label className="lbl">Status
          <select className="field" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="lbl">Applied date
          <input className="field" type="date" value={form.applied_date} onChange={set('applied_date')} />
        </label>
        <label className="lbl">Location
          <input className="field" placeholder="Ljubljana / Remote" value={form.location} onChange={set('location')} />
        </label>
        <label className="lbl">Salary
          <input className="field" placeholder="e.g. 2000/mo" value={form.salary} onChange={set('salary')} />
        </label>
      </div>
      <label className="lbl">Job link
        <input className="field" placeholder="https://..." value={form.link} onChange={set('link')} />
      </label>
      <label className="lbl">Notes
        <textarea className="field field--area" rows={2} value={form.notes} onChange={set('notes')} />
      </label>
      {error && <div className="form-error">{error}</div>}
      <div className="panel__actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving...' : 'Add application'}</button>
      </div>
    </form>
  )
}
