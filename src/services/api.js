import { CONFIG } from '../config'

async function post(action, body) {
  if (!CONFIG.API_URL) return null

  const res = await fetch(`${CONFIG.API_URL}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  })

  if (!res.ok) throw new Error(`API HTTP ${res.status}`)
  const data = await res.json()

  if (data && data.ok === false) {
    throw new Error(data.error || 'API 發生錯誤')
  }

  return data
}

export async function loadPlayer(idToken, profile) {
  const remote = await post('load', { idToken })

  if (remote?.player) return remote.player

  const key = `theheroes:${profile.userId}`
  const local = JSON.parse(localStorage.getItem(key) || 'null')

  if (local) {
    return {
      ...local,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl || ''
    }
  }

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl || '',
    level: 1,
    exp: 0,
    gold: 100,
    gems: 10,
    hp: 120,
    maxHp: 120,
    attack: 18,
    defense: 5,
    stage: 1,
    monsterIndex: 0,
    totalKills: 0,
    className: '戰士'
  }
}

export async function savePlayer(idToken, player) {
  const key = `theheroes:${player.userId}`
  localStorage.setItem(key, JSON.stringify(player))

  if (!CONFIG.API_URL) return

  await post('save', { idToken, player })
}
