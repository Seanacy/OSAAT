import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PotDisplay from '../components/PotDisplay'
import { TrendingUp, Share2, ArrowRight, LogOut } from 'lucide-react'

interface Action {
  id: string
  name: string
  pointValue: number
  category: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [nextAction, setNextAction] = useState<Action | null>(null)
  const [recentCompletions, setRecentCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState(1)
  const [progressToNextTier, setProgressToNextTier] = useState(0)

  useEffect(() => {
    loadData()
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return
    setLoading(true)

    try {
      // Load next recommended action
      const { data: actions } = await supabase
        .from('actions')
        .select('*')
        .eq('isEnabled', true)
        .gte('minTierRequired', user.tier || 1)
        .limit(1)

      if (actions && actions.length > 0) {
        setNextAction(actions[0])
      }

      // Load recent completions
      const { data: completed } = await supabase
        .from('user_actions')
        .select('*')
        .eq('userId', user.id)
        .eq('status', 'completed')
        .order('completedAt', { ascending: false })
        .limit(5)

      setRecentCompletions(completed || [])

      // Calculate tier and progress
      const points = user.points || 0
      const newTier = Math.floor(points / 1000) + 1
      const pointsInCurrentTier = points % 1000
      const progress = (pointsInCurrentTier / 1000) * 100

      setTier(newTier)
      setProgressToNextTier(progress)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-300 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-primary-100 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold">{user?.firstName || 'User'}</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-primary-700 rounded-lg transition"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Points Display */}
        <div className="bg-white/20 backdrop-blur rounded-lg p-6 mb-4">
          <p className="text-primary-100 text-sm mb-2">Current Points</p>
          <div className="text-5xl font-bold mb-4">{user?.points || 0}</div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary-100">Tier {tier}</span>
              <span className="text-primary-100">{Math.round(progressToNextTier)}%</span>
            </div>
            <div className="w-full bg-primary-700/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressToNextTier}%` }}
              ></div>
            </div>
            <p className="text-xs text-primary-100 mt-2">
              {1000 - (user?.points || 0) % 1000} points to next tier
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to="/point-sharing"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <Share2 size={18} />
            Share Points
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Pot Display */}
        <PotDisplay />

        {/* Next Recommended Action */}
        {nextAction && (
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-accent-500">
            <p className="text-xs text-gray-500 mb-2">NEXT RECOMMENDED</p>
            <h3 className="font-bold text-gray-900 mb-2">{nextAction.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <TrendingUp className="inline mr-1" size={16} />
                {nextAction.pointValue} points
              </span>
              <Link
                to={`/actions/${nextAction.id}`}
                className="text-accent-600 hover:text-accent-700 flex items-center gap-1"
              >
                Take Action
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* Recent Actions */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
          {recentCompletions.length > 0 ? (
            <div className="space-y-2">
              {recentCompletions.map((action) => (
                <div key={action.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Completed: {action.actionId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(action.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>

        {/* Cashout Section */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <h3 className="font-bold text-gray-900 mb-2">Ready to Cash Out?</h3>
          <p className="text-sm text-gray-700 mb-4">
            You need at least 500 points. You have {user?.points || 0} points.
          </p>
          <Link
            to="/cashout"
            className={`block text-center py-2 px-4 rounded-lg font-semibold transition ${
              (user?.points || 0) >= 500
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Request Cashout
          </Link>
        </div>
      </div>
    </div>
  )
}
