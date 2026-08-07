export default function PlayerHeader({ player }) {
  const need = Math.floor(80 * Math.pow(1.18, Math.max(0, player.level - 1)))
  const expPct = Math.min(100, Math.round((player.exp / need) * 100))

  return (
    <header className="player-header">
      <div className="player-info">
        <img
          className="avatar"
          src={player.pictureUrl || 'https://placehold.co/100x100/243447/ffffff?text=H'}
          alt=""
        />
        <div className="player-meta">
          <div className="player-name">{player.displayName || '勇者'}</div>
          <div className="player-level">Lv.{player.level} · {player.className || '戰士'}</div>
          <div className="expbar">
            <div className="expfill" style={{ width: `${expPct}%` }} />
          </div>
        </div>
      </div>

      <div className="currency">
        <div>🪙 {Number(player.gold || 0).toLocaleString()}</div>
        <div>💎 {Number(player.gems || 0).toLocaleString()}</div>
      </div>
    </header>
  )
}
