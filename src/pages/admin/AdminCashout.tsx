import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Check } from 'lucide-react'

interface CashoutRequest {
  id: string
  userId: string
  points: number
  cashAmount: number
  paymentMethod: string
  code: string
  status: 'pending' | 'sent' | 'completed'
  createdAt: string
}

export default function AdminCashout() {
  const [requests, setRequests] = useState<CashoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'sent' | 'completed'>('pending')

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cashout_requests')
        .select('*')
        .eq('status', filter)
        .order('createdAt', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkSent = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('cashout_requests')
        .update({ status: 'sent' })
        .eq('id', requestId)

      if (error) throw error
      loadRequests()
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  const handleMarkCompleted = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('cashout_requests')
        .update({ status: 'completed' })
        .eq('id', requestId)

      if (error) throw error
      loadRequests()
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cashout Requests</h1>
        <div className="flex gap-2">
          {['pending', 'sent', 'completed'].map((f) => (
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
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg p-6 shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-gray-900">
                    ${request.cashAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {request.points} points • {request.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : request.status === 'sent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Code</p>
                <p className="font-mono font-bold text-gray-900">{request.code}</p>
              </div>

              {request.status === 'pending' && (
                <button
                  onClick={() => handleMarkSent(request.id)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 rounded transition"
                >
                  Mark as Sent
                </button>
              )}

              {request.status === 'sent' && (
                <button
                  onClick={() => handleMarkCompleted(request.id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 rounded transition"
                >
                  <Check size={18} />
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No {filter} cashout requests
        </div>
      )}
    </div>
  )
}
