import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Verification {
  id: string
  userId: string
  actionId: string
  status: 'pending' | 'completed' | 'verified'
  completedAt: string
  proofUrl?: string
  notes?: string
  fromExtras?: boolean
}

// Extra$$$ pays 75% of the original points, rounded to the nearest 50.
function extraPoints(p: number): number {
  return Math.round((p * 0.75) / 50) * 50
}

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'verified'>('pending')

  useEffect(() => {
    loadVerifications()
  }, [filter])

  const loadVerifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('osaat_user_actions')
        .select('*')
        .eq('status', filter === 'pending' ? 'pending' : 'verified')
        .order('completedAt', { ascending: false })

      if (error) throw error
      setVerifications(data || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (
    verificationId: string,
    userId: string,
    actionId: string,
    fromExtras: boolean
  ) => {
    try {
      // Get the action to get point value
      const { data: action } = await supabase
        .from('osaat_actions')
        .select('pointValue')
        .eq('id', actionId)
        .single()

      // Update verification status
      await supabase
        .from('osaat_user_actions')
        .update({ status: 'verified' })
        .eq('id', verificationId)

      // Add points to user (75% if completed from Extra$$$)
      if (action) {
        const { data: user } = await supabase
          .from('osaat_users')
          .select('points')
          .eq('id', userId)
          .single()

        if (user) {
          const earned = fromExtras ? extraPoints(action.pointValue) : action.pointValue
          await supabase
            .from('osaat_users')
            .update({ points: (user.points || 0) + earned })
            .eq('id', userId)
        }
      }

      loadVerifications()
    } catch (error) {
      console.error('Error approving verification:', error)
    }
  }

  const handleReject = async (verificationId: string) => {
    try {
      await supabase
        .from('osaat_user_actions')
        .delete()
        .eq('id', verificationId)

      loadVerifications()
    } catch (error) {
      console.error('Error rejecting verification:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Verifications</h1>
        <div className="flex gap-2">
          {['pending', 'verified'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded font-semibold transition ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : verifications.length > 0 ? (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div key={v.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-gray-900">Action: {v.actionId}</p>
                  <p className="text-sm text-gray-600">
                    User: {v.userId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(v.completedAt).toLocaleString()}
                  </p>
                  {v.fromExtras && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200">
                      Extra$$$ · awards 75%
                    </span>
                  )}
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    v.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>
              </div>

              {v.notes && (
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Notes</p>
                  <p className="text-sm text-gray-700 break-words">{v.notes}</p>
                </div>
              )}

              {v.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(v.id, v.userId, v.actionId, !!v.fromExtras)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 rounded transition"
                  >
                    <CheckCircle2 size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(v.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 rounded transition"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No {filter} verifications
        </div>
      )}
    </div>
  )
}
