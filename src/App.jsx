import { useEffect, useState } from 'react'
import { api, token } from './api'
import Auth from './components/Auth'
import Applications from './components/Applications'
import Companies from './components/Companies'

export default function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [tab, setTab] = useState('applications')

  useEffect(() => {
    if (!token.get()) { setBooting(false); return }
    api.me().then(setUser).catch(() => token.clear()).finally(() => setBooting(false))
  }, [])

  async function logout() {
    try { await api.logout() } catch { /* ignore */ }
    token.clear(); setUser(null)
  }

  if (booting) return <div className="boot">Loading...</div>
  if (!user) return <Auth onAuthed={setUser} />

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand"><span className="topbar__mark">▸</span><span>Tracklr</span></div>
        <nav className="tabs">
          <button className={`tab ${tab === 'applications' ? 'tab--on' : ''}`} onClick={() => setTab('applications')}>Applications</button>
          <button className={`tab ${tab === 'companies' ? 'tab--on' : ''}`} onClick={() => setTab('companies')}>Companies</button>
        </nav>
        <div className="topbar__user">
          <span className="topbar__who">{user.name}</span>
          <button className="topbar__out" onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="main">
        {tab === 'applications' ? <Applications /> : <Companies />}
      </main>
    </div>
  )
}
