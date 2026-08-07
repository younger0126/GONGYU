import { useEffect, useMemo, useRef, useState } from 'react'
import PlayerHeader from '../components/PlayerHeader'

const monsters = [
  { name: '森林史萊姆', icon: '🟢', hp: 55, gold: 12, exp: 10 },
  { name: '毒菇怪', icon: '🍄', hp: 72, gold: 15, exp: 13 },
  { name: '森林狼', icon: '🐺', hp: 95, gold: 20, exp: 17 },
  { name: '森林哥布林', icon: '👺', hp: 135, gold: 28, exp: 23 },
  { name: '森林守護者', icon: '🌳', hp: 220, gold: 55, exp: 48 }
]

function expNeed(level) {
  return Math.floor(80 * Math.pow(1.18, Math.max(0, level - 1)))
}

export default function Battle({ player, setPlayer, onBack, onSave }) {
  const [auto, setAuto] = useState(true)
  const [damageText, setDamageText] = useState('')
  const [monsterHp, setMonsterHp] = useState(1)
  const timerRef = useRef(null)

  const index = Math.min(4, Math.max(0, Number(player.monsterIndex || 0)))
  const base = monsters[index]
  const maxHp = useMemo(() => Math.floor(base.hp * (1 + (player.stage - 1) * 0.24)), [base.hp, player.stage])

  useEffect(() => setMonsterHp(maxHp), [maxHp, index])

  function levelUp(next) {
    while (next.exp >= expNeed(next.level)) {
      next.exp -= expNeed(next.level)
      next.level += 1
      next.maxHp += 22
      next.hp = next.maxHp
      next.attack += 5
      next.defense += 2
    }
  }

  function victory() {
    setPlayer(prev => {
      const next = { ...prev }
      next.gold += Math.floor(base.gold * (1 + (next.stage - 1) * 0.12))
      next.exp += Math.floor(base.exp * (1 + (next.stage - 1) * 0.10))
      next.totalKills += 1
      next.monsterIndex += 1

      levelUp(next)

      if (next.monsterIndex >= 5) {
        next.monsterIndex = 0
        next.stage += 1
      }

      setTimeout(() => onSave(next), 0)
      return next
    })
  }

  function attack(multiplier = 1) {
    if (monsterHp <= 0) return

    const crit = Math.random() < 0.12
    const variance = 0.88 + Math.random() * 0.24
    const dmg = Math.max(
      1,
      Math.floor(player.attack * multiplier * variance * (crit ? 1.8 : 1))
    )

    setDamageText(crit ? `💥 CRIT! -${dmg}` : `-${dmg}`)

    setMonsterHp(prev => {
      const next = Math.max(0, prev - dmg)
      if (next === 0) setTimeout(victory, 280)
      return next
    })

    setTimeout(() => setDamageText(''), 500)
  }

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (auto) {
      timerRef.current = setInterval(() => attack(1), 900)
    }

    return () => timerRef.current && clearInterval(timerRef.current)
  }, [auto, player.attack, monsterHp])

  const hpPct = Math.max(0, Math.round((monsterHp / maxHp) * 100))

  return (
    <div className="screen">
      <PlayerHeader player={player} />

      <div className="battle-top">
        <button className="back-btn" onClick={onBack}>← 返回聖城</button>
        <div className="stage-label">🌲 翡翠森林 · {player.stage}-{index + 1}</div>
      </div>

      <section className="battle-field">
        <div className="monster-icon">{base.icon}</div>
        <div className="monster-name">{base.name}{index === 4 ? ' · BOSS' : ''}</div>

        <div className="monster-hpbar">
          <div style={{ width: `${hpPct}%` }} />
        </div>
        <div className="monster-hptext">{monsterHp} / {maxHp}</div>

        {damageText && <div className="damage-pop">{damageText}</div>}

        <div className="hero-character">
          {player.className === '法師' ? '🧙‍♂️' : player.className === '弓箭手' ? '🏹' : '🗡️'}
        </div>
      </section>

      <section className="skill-row">
        <button onClick={() => attack(1)}>⚔️<span>普通攻擊</span></button>
        <button onClick={() => attack(1.7)}>🔥<span>烈焰斬</span></button>
        <button onClick={() => attack(2.2)}>⚡<span>雷擊</span></button>
        <button onClick={() => attack(3)}>🌪️<span>旋風斬</span></button>
      </section>

      <button className={`auto-btn ${auto ? 'on' : ''}`} onClick={() => setAuto(v => !v)}>
        ● 自動戰鬥 {auto ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}
