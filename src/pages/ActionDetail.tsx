import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ChevronLeft, AlertCircle, Upload, Zap } from 'lucide-react'

interface Action {
  id: string
  name: string
  category: string
  pointValue: number
  cashValue: number
  minTierRequired: number
  isRepeatable: boolean
  verificationType: string
  description?: string
}

export default function ActionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [action, setAction] = useState<Action | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [emailContent, setEmailContent] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    loadAction()
  }, [id])

  const loadAction = async () => {
    if (!id) return
    try {
      const { data, error: fetchError } = await supabase
        .from('actions')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setAction(data)
    } catch (error) {
      console.error('Error loading action:', error)
      setError('Failed to load action')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!session?.user.id || !action) return
    setSubmitting(true)
    setError('')

    try {
      // Create user action record
      const { error: insertError } = await supabase.from('user_actions').insert([
        {
          userId: session.user.id,
          actionId: action.id,
          status: action.verificationType === 'tap_to_complete' ? 'completed' : 'pending',
          completedAt: action.verificationType === 'tap_to_complete' ? new Date().toISOString() : null,
          proofUrl: proofFile ? `uploaded-${Date.now()}` : null,
          notes: emailContent || null,
        },
      ])

      if (insertError) throw insertError

      // If tap to complete, add points
      if (action.verificationType === 'tap_to_complete') {
        const newPoints = (user?.points || 0) + action.pointValue
        await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', session.user.id)
      }

      setCompleted(true)
      setTimeout(() => navigate('/actions'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit action')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-300 border-t-primary-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (!action) {
    return (
      <div className="p-4">
        <Link to="/actions" className="flex items-center gap-2 text-accent-600 mb-6">
          <ChevronLeft size={20} />
          Back
        </Link>
        <p className="text-red-600">Action not found</p>
      </div>
    )
  }

  const isLocked = action.minTierRequired > (user?.tier || 1)

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 pb-8">
          <Link to="/actions" className="flex items-center gap-2 mb-6 text-accent-100 hover:text-white">
            <ChevronLeft size={20} />
            Back
          </Link>
          <h1 className="text-3xl font-bold">{action.name}</h1>
        </div>

        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-amber-600" size={40} />
            <h2 className="text-lg font-bold text-amber-900 mb-2">Locked</h2>
            <p className="text-amber-800 mb-4">
              This action requires Tier {action.minTierRequired}. You're currently at Tier {user?.tier || 1}.
            </p>
            <p className="text-sm text-amber-700">
              Earn more points to unlock this action!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 pb-8">
        <Link to="/actions" className="flex items-center gap-2 mb-6 text-accent-100 hover:text-white">
          <ChevronLeft size={20} />
          Back
        </Link>
        <h1 className="text-3xl font-bold">{action.name}</h1>
        <p className="text-accent-100 mt-2">Category: {action.category}</p>
      </div>

      <div className="p-4">
        {/* Rewards */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">REWARDS</p>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold text-primary-600 flex items-center gap-1">
                <Zap size={28} />
                {action.pointValue}
              </div>
              <p className="text-sm text-gray-600 mt-1">points</p>
            </div>
            {action.cashValue > 0 && (
              <div>
                <div className="text-3xl font-bold text-accent-600">
                  ${action.cashValue}
                </div>
                <p className="text-sm text-gray-600 mt-1">cash value</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Details */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">DETAILS</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold text-gray-900 capitalize">
                {action.verificationType.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Repeatable</span>
              <span className="font-semibold text-gray-900">
                {action.isRepeatable ? 'Yes' : 'Once only'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submission Form */}
        {!completed ? (
          <>
            {action.verificationType === 'tap_to_complete' && (
              <p className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 text-sm mb-4">
                Just tap the button below to complete this action and earn your points!
              </p>
            )}

            {(action.verificationType === 'proof_upload' || action.verificationType === 'document_upload') && (
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Proof
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="font-semibold text-gray-700">
                      {proofFile ? proofFile.name : 'Click to upload proof'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 10MB</p>
                  </label>
                </div>
              </div>
            )}

            {action.verificationType === 'email_forward' && (
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Paste Email Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Paste the email content here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition h-32"
                />
              </div>
            )}

            {action.verificationType === 'stripe_identity_ssn_covered' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-900 font-semibold mb-2">Important!</p>
                <p className="text-amber-800 text-sm">
                  You MUST cover your SSN before taking the photo. Use your hand or a piece of paper to obscure it.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg"
            >
              {submitting ? 'Submitting...' : `Complete & Earn ${action.pointValue} Points`}
            </button>
          </>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 font-bold mb-2">
              {action.verificationType === 'tap_to_complete'
                ? 'Action completed!'
                : 'Submission received!'}
            </div>
            <p className="text-green-800 text-sm mb-4">
              {action.verificationType === 'tap_to_complete'
                ? `You earned ${action.pointValue} points!`
                : 'Your submission is pending verification.'}
            </p>
            <p className="text-xs text-green-700">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  )
}
