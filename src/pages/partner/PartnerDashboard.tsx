import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, MessageSquare, LogOut } from 'lucide-react'

interface Verification {
  id: string
  userId: string
  actionId: string
  status: 'pending' | 'completed'
  completedAt: string
  proofUrl?: string
  notes?: string
}

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('*')
        .eq('status', 'pending')
        .order('completedAt', { ascending: false })

      if (error) throw error
      setVerifications(data || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (verificationId: string, actionId: string, userId: string) => {
    try {
      // Get action points
      const { data: action } = await supabase
        .from('actions')
        .select('pointValue')
        .eq('id', actionId)
        .single()

      // Update status
      await supabase
        .from('user_actions')
        .update({ status: 'completed' })
        .eq('id', verificationId)

      // Add points
      if (action) {
        const { data: user } = await supabase
          .from('users')
          .select('points')
          .eq('id', userId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({ points: (user.points || 0) + action.pointValue })
            .eq('id', userId)
        }
      }

      loadVerifications()
    } catch (error) {
      console.error('Error approving verification:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      await supabase.from('partner_messages').insert([
        {
          message: message.trim(),
          createdAt: new Date().toISOString(),
        },
      ])

      setMessage('')
      alert('Message sent to admin')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/partner/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-accent-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Partner Portal</h1>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Pending Verifications</h1>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : verifications.length > 0 ? (
          <div className="space-y-4">
            {verifications.map((v) => (
              <div key={v.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-gray-900">Action: {v.actionId}</p>
                    <p className="text-sm text-gray-600">User: {v.userId.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(v.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    Pending
                  </span>
                </div>

                {v.notes && (
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Submission Notes</p>
                    <p className="text-sm text-gray-700 break-words">{v.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => handleApprove(v.id, v.actionId, v.userId)}
                  className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 rounded transition"
                >
                  <CheckCircle2 size={18} />
                  Approve & Award Points
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <CheckCircle2 className="mx-auto mb-4 text-gray-400" size={40} />
            <p>No pending verifications</p>
          </div>
        )}

        {/* Message to Admin */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Send Message to Admin
          </h2>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition h-24"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              className="w-full bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
