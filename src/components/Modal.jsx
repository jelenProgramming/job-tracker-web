export default function Modal({ title, children, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }) {
  return (
    <div className="modal__backdrop" onClick={onCancel}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        {title && <div className="modal__title">{title}</div>}
        {children && <div className="modal__body">{children}</div>}
        <div className="modal__actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
