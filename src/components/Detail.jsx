import { useState } from 'react'
import { api, STATUSES } from '../api'
import Modal from './Modal'

export default function Detail({ app, onChanged, onDeleted }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [editingNote, setEditingNote] = useState('')
  const [deletingEventId, setDeletingEventId] = useState(null)

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
    setBusy(true)
    try { await api.deleteApplication(app.id); onDeleted() }
    finally { setBusy(false); setConfirmingDelete(false) }
  }

  function startEditEvent(ev) {
    setEditingEventId(ev.id)
    setEditingNote(ev.note)
  }
  async function saveEditEvent() {
    if (!editingNote.trim()) return
    setBusy(true)
    try { await api.updateEvent(app.id, editingEventId, editingNote.trim()); setEditingEventId(null); onChanged() }
    finally { setBusy(false) }
  }
  async function confirmDeleteEvent() {
    setBusy(true)
    try { await api.deleteEvent(app.id, deletingEventId); onChanged() }
    finally { setBusy(false); setDeletingEventId(null) }
  }

  return (
    <div className="panel">
      <div className="detail__head">
        <div>
          <div className="detail__pos">{app.position}</div>
          <div className="detail__co">{app.company?.name}</div>
        </div>
        <button className="xdel" onClick={() => setConfirmingDelete(true)}>x</button>
      </div>

      <div className="detail__meta">
        {app.location && <span>{app.location}</span>}
        {app.salary && <span>€ {app.salary}</span>}
        {app.applied_date && <span>Applied {new Date(app.applied_date).toLocaleDateString('en-GB')}</span>}
        {app.link && <span><a href={app.link} target="_blank" rel="noreferrer">Job link</a></span>}
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
              <div className="tl__content">
                {editingEventId === ev.id ? (
                  <div className="tl__edit">
                    <input
                      className="field"
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      autoFocus
                    />
                    <div className="tl__editActions">
                      <button type="button" className="btn" onClick={() => setEditingEventId(null)} disabled={busy}>Cancel</button>
                      <button type="button" className="btn btn--primary" onClick={saveEditEvent} disabled={busy}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tl__note">{ev.note}</div>
                    <div className="tl__time">{new Date(ev.created_at).toLocaleString()}</div>
                  </>
                )}
              </div>
              {editingEventId !== ev.id && (
                <div className="tl__actions">
                  <button type="button" className="tl__action" onClick={() => startEditEvent(ev)}>Edit</button>
                  <button type="button" className="tl__action tl__action--danger" onClick={() => setDeletingEventId(ev.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {confirmingDelete && (
        <Modal
          title="Delete this application?"
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={remove}
          onCancel={() => setConfirmingDelete(false)}
        >
          This removes {app.position} at {app.company?.name} and its whole timeline. This can't be undone.
        </Modal>
      )}

      {deletingEventId && (
        <Modal
          title="Delete this timeline entry?"
          confirmLabel="Delete"
          danger
          busy={busy}
          onConfirm={confirmDeleteEvent}
          onCancel={() => setDeletingEventId(null)}
        >
          This entry will be permanently removed from the activity log.
        </Modal>
      )}
    </div>
  )
}
