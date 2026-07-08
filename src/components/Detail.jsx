import { useState } from 'react'
import { api, STATUSES } from '../api'

export default function Detail({ app, onChanged, onDeleted }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function changeStatus(e) {
    await api.updateStatus(app.id, e.target.value)
    onChanged()
  }
  async function addNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    setBusy(true)
    try { await api.addEvent(app.id, note.trim()); setNote(''); onChanged() }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!confirm('Delete this application?')) return
    await api.deleteApplication(app.id); onDeleted()
  }

  return (
    <div className="panel">
      <div className="detail__head">
        <div>
          <div className="detail__pos">{app.position}</div>
          <div className="detail__co">{app.company?.name}</div>
        </div>
        <button className="xdel" onClick={remove}>×</button>
      </div>

      <div className="detail__meta">
        {app.location && <span>◎ {app.location}</span>}
        {app.salary && <span>€ {app.salary}</span>}
        {app.applied_date && <span>◷ applied {new Date(app.applied_date).toLocaleDateString('en-GB')}</span>}
        {app.link && <span><a href={app.link} target="_blank" rel="noreferrer">job link ↗</a></span>}
      </div>

      <label className="lbl detail__status">Status
        <select className={`field status-${app.status}`} value={app.status} onChange={changeStatus}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      {app.notes && <p className="detail__notes">{app.notes}</p>}

      <div className="timeline">
        <div className="timeline__label">Activity</div>
        <form className="timeline__add" onSubmit={addNote}>
          <input className="field" placeholder="Add a note (interview, follow-up...)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn--primary" disabled={busy}>Add</button>
        </form>
        <ul className="timeline__list">
          {app.events?.map((ev) => (
            <li key={ev.id} className={`tl ${ev.type === 'status' ? 'tl--status' : ''}`}>
              <span className="tl__dot" />
              <div>
                <div className="tl__note">{ev.note}</div>
                <div className="tl__time">{new Date(ev.created_at).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
