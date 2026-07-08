import { useState } from 'react'
import { api, token } from '../api'

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const fn = mode === 'login' ? api.login : api.register
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const res = await fn(payload)
      token.set(res.token)
      onAuthed(res.user)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand"><span className="auth__mark">▸</span> Tracklr</div>
        <p className="auth__tag">Every application, one place. No more spreadsheet chaos.</p>
        <div className="auth__switch">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && <input className="field" placeholder="Your name" value={form.name} onChange={set('name')} />}
          <input className="field" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
          <input className="field" type="password" placeholder="Password" value={form.password} onChange={set('password')} />
          {error && <div className="auth__error">{error}</div>}
          <button className="auth__btn" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
