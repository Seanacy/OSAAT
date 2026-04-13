import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, Zap } from 'lucide-react'

export default function FirstWinPage() {
  const navigate = useNavigate()
  const { session, user } = useAuth()
  const [actionCompleted, setActionCompleted] = useState(false)
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setPoints(user.points || 0)
    }
  }, [user])

  const handleCompleteCheckin = async () => {
    setLoading(true)
    try {
      if (!session?.user.id) {
        throw new Error('No user session')
      }

      // Add points to user
      const newPoints = points + 100
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      // Record the action completion
      const { error: actionError } = await supabase.from('user_actions').insert([
        {
          userId: session.user.id,
          actionId: 'weekly-checkin',
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      ])

      if (actionError) throw actionError

      setPoints(newPoints)
      setActionCompleted(true)

      // Auto-navigate after a delay
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Error completing action:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your First Win</h2>
        <p className="text-gray-600">Step 3 of 4</p>
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <Zap className="text-primary-600" size={40} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Weekly Check-In
        </h3>
        <p className="text-center text-gray-600 mb-6">
          A simple way to stay connected and earn points
        </p>

        <div className="bg-white rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What you'll earn:</strong>
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-primary-500" size={20} />
            <span className="text-lg font-bold text-primary-600">100 points</span>
          </div>
        </div>

        {!actionCompleted ? (
          <button
            onClick={handleCompleteCheckin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg transform hover:scale-105"
          >
            {loading ? 'Completing...' : 'Complete Check-In'}
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle2 className="text-green-600 mx-auto mb-2" size={32} />
            <p className="text-green-900 font-bold mb-1">Great job!</p>
            <p className="text-green-800 text-sm">You earned 100 points!</p>
            <div className="mt-4 text-2xl font-bold text-primary-600">
              {points} points
            </div>
          </div>
        )}
      </div>

      {actionCompleted && (
        <div className="text-center text-sm text-gray-500">
          Redirecting to your dashboard...
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Link to="/onboarding/cashout-code" className="text-accent-600 hover:text-accent-700 font-semibold">
          Back
        </Link>
        <p className="text-sm text-gray-500">3 of 4</p>
      </div>
    </div>
  )
}
