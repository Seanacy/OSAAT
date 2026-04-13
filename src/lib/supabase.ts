import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email?: string
  phone?: string
  firstName: string
  nickname?: string
  points: number
  tier: number
  createdAt: string
  lastLoginAt: string
  isSuspended: boolean
  cashoutCode: string
}

export type Action = {
  id: string
  name: string
  category: string
  pointValue: number
  cashValue: number
  minTierRequired: number
  isRepeatable: boolean
  verificationType: 'tap_to_complete' | 'proof_upload' | 'document_upload' | 'email_forward' | 'partner_portal' | 'stripe_identity' | 'stripe_identity_ssn_covered' | 'mutual_app_confirmation'
  isEnabled: boolean
  createdAt: string
}

export type UserAction = {
  id: string
  userId: string
  actionId: string
  status: 'pending' | 'completed' | 'verified'
  completedAt?: string
  verifiedAt?: string
  proofUrl?: string
  notes?: string
}

export type CashoutRequest = {
  id: string
  userId: string
  points: number
  cashAmount: number
  paymentMethod: 'cashapp' | 'venmo'
  code: string
  status: 'pending' | 'sent' | 'completed'
  createdAt: string
}
