import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://vvjwvneoifmodpxsprcc.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7ptXim1QKAg83FAFkyHNcA_yYW7eR2Z'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export async function diagnoseSupabase(){
  const report={url:SUPABASE_URL,projectRef:'vvjwvneoifmodpxsprcc',api:false,auth:false,key:false,detail:''}
  try{
    const api=await fetch(`${SUPABASE_URL}/rest/v1/`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}})
    report.api=api.ok || api.status===404
    report.key=api.status!==401 && api.status!==403
    if(!report.key){report.detail=`API 金鑰被拒絕（HTTP ${api.status}）`;return report}
  }catch(e){report.detail=`REST API 無法連線：${e.message}`;return report}
  try{
    const auth=await fetch(`${SUPABASE_URL}/auth/v1/settings`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}})
    report.auth=auth.ok
    if(!auth.ok){report.detail=`Auth API 回應 HTTP ${auth.status}`;return report}
  }catch(e){report.detail=`Auth API 無法連線：${e.message}`;return report}
  report.detail='Supabase API、Publishable key 與 Auth API 連線正常。'
  return report
}
