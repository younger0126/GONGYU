import { useEffect, useState } from 'react'
import { initLiff } from './services/liff'
import { loadPlayer, savePlayer } from './services/api'
import Home from './pages/Home'
import Battle from './pages/Battle'
import './styles/main.css'

export default function App() {
  const [status, setStatus] = useState('正在連接 LINE...')
  const [error, setError] = useState('')
  const [player, setPlayer] = useState(null)
  const [idToken, setIdToken] = useState('')
  const [page, setPage] = useState('home')

  useEffect(() => {
    bootstrap()
  }, [])

  async function bootstrap() {
    try {
      setStatus('正在初始化 LIFF...')
      const session = await initLiff()
      if (!session) return

      setIdToken(session.idToken)
      setStatus('正在讀取冒險進度...')

      const p = await loadPlayer(session.idToken, session.profile)
      setPlayer(p)
    } catch (e) {
      setError(e?.message || String(e))
    }
  }

  async function save(nextPlayer = player) {
    try {
      await savePlayer(idToken, nextPlayer)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!player) return
    const t = setInterval(() => save(player), 12000)
    return () => clearInterval(t)
  }, [player, idToken])

  if (error) {
    return (
      <div className="center-state">
        <h1>THE HEROES</h1>
        <h2>勇者之境</h2>
        <div className="error-box">{error}</div>
        <button className="primary-action" onClick={() => location.reload()}>重新載入</button>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="center-state">
        <div className="logo-big">THE HEROES</div>
        <div className="logo-sub">勇者之境</div>
        <div className="loading-orb" />
        <p>{status}</p>
      </div>
    )
  }

  return page === 'battle'
    ? <Battle player={player} setPlayer={setPlayer} onBack={() => setPage('home')} onSave={save} />
    : <Home player={player} onAdventure={() => setPage('battle')} />
}
