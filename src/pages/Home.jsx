import PlayerHeader from '../components/PlayerHeader'

export default function Home({ player, onAdventure }) {
  return (
    <div className="screen">
      <PlayerHeader player={player} />

      <section className="city-hero">
        <div className="world-tree">✦</div>
        <div className="city-title">勇者聖城</div>
        <div className="city-subtitle">世界樹仍在等待新的勇者。</div>

        <button className="primary-action" onClick={onAdventure}>
          ⚔️ 開始冒險
        </button>
      </section>

      <section className="menu-grid">
        <button disabled>👤<span>角色</span></button>
        <button disabled>🎒<span>背包</span></button>
        <button disabled>📜<span>任務</span></button>
        <button disabled>🎁<span>信箱</span></button>
        <button disabled>🏪<span>商店</span></button>
        <button disabled>⚙️<span>設定</span></button>
      </section>

      <div className="alpha-note">Sprint 1 · 其他功能會在下一版本開放</div>
    </div>
  )
}
