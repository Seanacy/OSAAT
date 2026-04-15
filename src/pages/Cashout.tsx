import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react'

interface CashoutRequest {
  id: string
  points: number
  cashAmount: number
  paymentMethod: string
  code: string
  status: 'pending' | 'sent' | 'completed'
  createdAt: string
}

export default function CashoutPage() {
  const { user, session } = useAuth()
  const [pointsToRedeem, setPointsToRedeem] = useState('500')
  const [paymentMethod, setPaymentMethod] = useState<'cashapp' | 'venmo'>('cashapp')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [requests, setRequests] = useState<CashoutRequest[]>([])
  const [showForm, setShowForm] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [potAvailable, setPotAvailable] = useState<number | null>(null)

  useEffect(() => {
    loadRequests()
    loadPot()
  }, [session?.user.id])

  const loadPot = async () => {
    try {
      const { data } = await supabase
        .from('westaackr_pot')
        .select('current_cashout_balance')
        .limit(1)
        .single()
      if (data) setPotAvailable(Number(data.current_cashout_balance) || 0)
    } catch (error) {
      console.error('Error loading pot:', error)
    }
  }

  const loadRequests = async () => {
    if (!session?.user.id) return
    try {
      const { data, error: fetchError } = await supabase
        .from('cashout_requests')
        .select('*')
        .eq('userId', session.user.id)
        .order('createdAt', { ascending: false })

      if (fetchError) throw fetchError
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const points = parseInt(pointsToRedeem)

      if (isNaN(points) || points < 500 || points > 10000) {
        setError('Points must be between 500 and 10,000')
        setLoading(false)
        return
      }

      if ((user?.points || 0) < points) {
        setError(`You only have ${user?.points} points`)
        setLoading(false)
        return
      }

      if (potAvailable !== null && potAvailable < 3) {
        setError(`Cashouts are paused. The community pot is below the $3 minimum (currently $${potAvailable.toFixed(2)}).`)
        setLoading(false)
        return
      }

      if (!code.trim()) {
        setError('Please enter your cashout code')
        setLoading(false)
        return
      }

      const cashAmount = points / 100

      const { error: insertError } = await supabase.from('cashout_requests').insert([
        {
          userId: session?.user.id,
          points,
          cashAmount,
          paymentMethod,
          code: code.trim(),
          status: 'pending',
        },
      ])

      if (insertError) throw insertError

      setSuccessMessage(
        `Cashout request created! Check your ${paymentMethod === 'cashapp' ? 'CashApp' : 'Venmo'} for the payment request.`
      )
      setPointsToRedeem('500')
      setCode('')
      setShowForm(false)

      // Reload requests
      setTimeout(() => {
        loadRequests()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create cashout request')
    } finally {
      setLoading(false)
    }
  }

  const availablePoints = user?.points || 0
  const cashAmount = (parseInt(pointsToRedeem) || 0) / 100

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-8">
        <h1 className="text-3xl font-bold">Cashout</h1>
        <p className="text-primary-100 mt-2">Convert your points to cash</p>
      </div>

      <div className="p-4">
        {/* Available Points */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6 mb-6 border border-primary-200">
          <p className="text-sm text-gray-600 mb-2">Available Points</p>
          <div className="text-4xl font-bold text-primary-600 mb-3">
            {availablePoints}
          </div>
          <p className="text-sm text-gray-700">
            = ${(availablePoints / 100).toFixed(2)} cash value
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong>How it works:</strong> Request your cashout below, then send a payment request on CashApp or Venmo to OSAAT. Put your code in the payment notes.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Cashout Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Request Cashout</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points to Redeem
                </label>
                <input
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  min="500"
                  max="10000"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Min: 500, Max: 10,000</p>
              </div>

              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cash Equivalent</p>
                <p className="text-2xl font-bold text-primary-600">${cashAmount.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="cashapp"
                      checked={paymentMethod === 'cashapp'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cashapp' | 'venmo')}
                      className="mr-2"
                    />
                    <span className="font-semibold">CashApp</span>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      value="venmo"
                      checked={paymentMethod === 'venmo'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cashapp' | 'venmo')}
                      className="mr-2"
                    />
                    <span className="font-semibold">Venmo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Cashout Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your cashout code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {potAvailable !== null && potAvailable < 3 && (
                <div className="flex gap-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-700 text-sm">
                    Cashouts are paused — community pot is below the $3 minimum (currently ${potAvailable.toFixed(2)}).
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || availablePoints < 500 || (potAvailable !== null && potAvailable < 3)}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all text-lg"
              >
                {loading ? 'Processing...' : `Request ${cashAmount.toFixed(2)} Cashout`}
              </button>
            </div>
          </form>
        )}

        {/* Pending Requests */}
        {requests.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Your Cashout Requests</h3>
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primary-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        ${request.cashAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.points} points • {request.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : request.status === 'sent'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="bg-amber-50 rounded p-3 text-xs text-amber-900 mb-3">
                      Next: Send payment request to OSAAT on {request.paymentMethod === 'cashapp' ? 'CashApp' : 'Venmo'}. Use code: <strong>{request.code}</strong> in notes.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(request.code)
                      setCopiedCode(request.id)
                      setTimeout(() => setCopiedCode(null), 2000)
                    }}
                    className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1"
                  >
                    <Copy size={12} />
                    {copiedCode === request.id ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-center py-3 text-accent-600 hover:text-accent-700 font-semibold"
          >
            Request Another Cashout
          </button>
        )}
      </div>
    </div>
  )
}
