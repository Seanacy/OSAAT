import { createClient } from '@supabase/supabase-js'

// OSAAT's own database has no location_pings table. Location pings are
// intentionally sent to the shared TentCity project instead, so OSAAT's
// signed-in users land in the same shared table as BridgeWork's and
// TentCity's users (tagged app_source: 'osaat').
const trackingClient = createClient(
  'https://skdqogcectobrvokjxkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHFvZ2NlY3RvYnJ2b2tqeGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzY4NTEsImV4cCI6MjA5NTc1Mjg1MX0.kixz5uR-X2XmlJTqw8QZ58k9IDBlT1Gjo0TcQZ9DWJ0'
)

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
        await trackingClient.from('location_pings').insert({
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
