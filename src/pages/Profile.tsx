import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LogOut, Copy, Check, Bell } from 'lucide-react'

interface VerificationStatus {
  pending: number
  completed: number
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [verification, setVerification] = useState<VerificationStatus>({
    pending: 0,
    completed: 0,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus()
    }
  }, [user?.id])

  const loadVerificationStatus = async () => {
    if (!user?.id) return
    try {
      const { data: pending } = await supabase
        .from('user_actions')
        .select('id')
        .eq('userId', user.id)
        .eq('status', 'pending')

      const { data: completed } = await supabase
        .from('user_actions')
        .select('id')
        .eq('userId', user.id)
        .eq('status', 'completed')

      setVerification({
        pending: pending?.length || 0,
        completed: completed?.length || 0,
      })
    } catch (error) {
      console.error('Error loading verification:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.cashoutCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-primary-100 mt-2">Your account and settings</p>
      </div>

      <div className="p-4">
        {/* User Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Name</p>
              <p className="font-semibold text-gray-900">{user?.firstName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Points Balance</p>
              <p className="text-2xl font-bold text-primary-600">{user?.points || 0}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Current Tier</p>
              <p className="font-semibold text-gray-900">
                Tier {Math.floor((user?.points || 0) / 1000) + 1}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Member Since</p>
              <p className="font-semibold text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Cashout Code */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cashout Code</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your private code for cashing out. Keep it safe!
          </p>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Code</p>
              <p className="font-mono font-bold text-gray-900">{user?.cashoutCode || 'Not set'}</p>
            </div>
            {user?.cashoutCode && (
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-gray-200 rounded transition flex items-center gap-1"
              >
                {copied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-gray-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Verification Status</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Pending Verification</span>
              <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">
                {verification.pending}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Completed</span>
              <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                {verification.completed}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <Link
          to="/notifications"
          className="flex items-center gap-3 bg-white rounded-lg p-5 shadow-sm mb-4 hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Bell size={20} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Notification Preferences</h3>
            <p className="text-xs text-gray-500">Milestones, tier ups, cashout alerts</p>
          </div>
          <span className="text-gray-400">›</span>
        </Link>

        {/* Support Links */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Support</h2>

          <div className="space-y-3">
            <a
              href="mailto:support@osaat.app"
              className="block px-4 py-3 text-center font-semibold text-accent-600 hover:text-accent-700 border border-accent-200 rounded-lg transition"
            >
              Contact Support
            </a>

            <a
              href="https://weStackr.com/osaat"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-center font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg transition"
            >
              About OSAAT (WeStackr)
            </a>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-lg transition border border-red-200"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
