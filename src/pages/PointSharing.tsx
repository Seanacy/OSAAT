import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, CheckCircle2, Search } from 'lucide-react'

interface UserSearchResult {
  id: string
  firstName: string
  points: number
}

export default function PointSharingPage() {
  const { user, session } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const [pointsToShare, setPointsToShare] = useState('50')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [weeklyUsed, setWeeklyUsed] = useState(0)

  const MAX_WEEKLY = 500
  const remainingThisWeek = MAX_WEEKLY - weeklyUsed

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const { data, error: searchError } = await supabase
        .from('users')
        .select('id, firstName, points')
        .ilike('firstName', `%${query}%`)
        .neq('id', session?.user.id)
        .limit(10)

      if (searchError) throw searchError
      setSearchResults(data || [])
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const points = parseInt(pointsToShare)

      if (isNaN(points) || points < 1 || points > 500) {
        setError('Share between 1 and 500 points')
        setLoading(false)
        return
      }

      if (points > remainingThisWeek) {
        setError(`You can only share ${remainingThisWeek} more points this week`)
        setLoading(false)
        return
      }

      if ((user?.points || 0) < points) {
        setError(`You only have ${user?.points} points`)
        setLoading(false)
        return
      }

      if (!selectedUser) {
        setError('Please select a user to share with')
        setLoading(false)
        return
      }

      // Create sharing transaction
      const { error: insertError } = await supabase.from('point_shares').insert([
        {
          fromUserId: session?.user.id,
          toUserId: selectedUser.id,
          points,
          createdAt: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      // Update sender's points
      await supabase
        .from('users')
        .update({ points: (user?.points || 0) - points })
        .eq('id', session?.user.id)

      // Update recipient's points
      await supabase
        .from('users')
        .update({ points: selectedUser.points + points })
        .eq('id', selectedUser.id)

      setSuccess(true)
      setSelectedUser(null)
      setPointsToShare('50')
      setSearchQuery('')
      setSearchResults([])
      setWeeklyUsed(weeklyUsed + points)

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to share points')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 pb-8">
        <h1 className="text-3xl font-bold">Share Points</h1>
        <p className="text-accent-100 mt-2">Help someone in the community</p>
      </div>

      <div className="p-4">
        {/* Weekly Limit Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 font-semibold mb-2">Weekly Limit</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-800">Used: {weeklyUsed} / {MAX_WEEKLY}</span>
            <span className="text-sm text-blue-800 font-semibold">Remaining: {remainingThisWeek}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(weeklyUsed / MAX_WEEKLY) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 font-semibold text-sm">Points shared!</p>
              <p className="text-green-600 text-xs mt-1">
                {selectedUser?.firstName} received {pointsToShare} points
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {/* Search User */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Find Person to Share With
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(result)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 ${
                        selectedUser?.id === result.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{result.firstName}</p>
                      <p className="text-xs text-gray-500">{result.points} points</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User */}
            {selectedUser && (
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <p className="text-sm text-gray-600 mb-1">Sharing with</p>
                <p className="font-bold text-primary-600">{selectedUser.firstName}</p>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-primary-600 hover:text-primary-700 mt-2"
                >
                  Change
                </button>
              </div>
            )}

            {/* Points Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points to Share
              </label>
              <input
                type="number"
                value={pointsToShare}
                onChange={(e) => setPointsToShare(e.target.value)}
                min="1"
                max="500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max {remainingThisWeek} points available this week
              </p>
            </div>

            {/* Your Current Balance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Your Points</p>
              <p className="text-2xl font-bold text-gray-900">{user?.points || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                After sharing: {Math.max(0, (user?.points || 0) - (parseInt(pointsToShare) || 0))}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedUser || remainingThisWeek <= 0}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg"
            >
              {loading ? 'Sharing...' : `Share ${pointsToShare} Points`}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 leading-relaxed">
            💡 <strong>Spread the wealth:</strong> Sharing points is a way to help friends and community members on their journey. There's no "request points" option—giving is what makes this work.
          </p>
        </div>
      </div>
    </div>
  )
}
