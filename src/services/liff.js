import { CONFIG } from '../config'

export async function initLiff() {
  if (!window.liff) throw new Error('找不到 LINE LIFF SDK')

  await window.liff.init({ liffId: CONFIG.LIFF_ID })

  if (!window.liff.isLoggedIn()) {
    window.liff.login({ redirectUri: window.location.href })
    return null
  }

  const profile = await window.liff.getProfile()
  const idToken = window.liff.getIDToken()

  if (!idToken) {
    throw new Error('無法取得 LINE ID token，請確認 LIFF Scope 有 openid')
  }

  return {
    profile,
    idToken
  }
}
