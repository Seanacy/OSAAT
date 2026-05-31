import { supabase } from './supabase'

const SESSION_ID = crypto.randomUUID()

async function hashUserId(userId: string): Promise<string> {
  const data = new TextEncoder().encode(userId)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function trackLocation(userId: string) {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const anonId = await hashUserId(userId)
        await supabase.from('location_pings').insert({
          anon_id: anonId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          app_source: 'osaat' as const,
          session_id: SESSION_ID,
        })
      } catch { /* silent */ }
    },
    () => { /* denied */ },
    { enableHighAccuracy: false, timeout: 10000 }
  )
}
