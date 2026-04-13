import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { AlertCircle } from 'lucide-react'

export default function CashoutCodePage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!code.trim()) {
        setError('Please enter a code')
        return
      }

      if (!session?.user.id) {
        setError('No user session found')
        return
      }

      // Update user with cashout code
      const { error: updateError } = await supabase
        .from('users')
        .update({ cashoutCode: code.trim() })
        .eq('id', session.user.id)

      if (updateError) throw updateError

      navigate('/onboarding/first-win')
    } catch (err: any) {
      setError(err.message || 'Failed to set code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Code</h2>
        <p className="text-gray-600">Step 2 of 3</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-900 leading-relaxed">
          This code is <strong>your private cashout code</strong>. You'll use it to verify your identity when you cash out. Write it down and keep it safe. Only you should know this code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter Any Word or Number
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g., Hope123 or Butterfly"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            This should be something only you'll remember
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            💡 <strong>Pro tip:</strong> Choose something meaningful to you that you won't forget.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all text-lg"
        >
          {loading ? 'Setting Code...' : 'Continue'}
        </button>
      </form>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Link to="/onboarding/create-account" className="text-accent-600 hover:text-accent-700 font-semibold">
          Back
        </Link>
        <p className="text-sm text-gray-500">2 of 3</p>
      </div>
    </div>
  )
}
