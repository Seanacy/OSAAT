import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Shield, Lock, RotateCcw } from 'lucide-react'

interface User {
  id: string
  firstName: string
  email?: string
  points: number
  tier: number
  isSuspended: boolean
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all')

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      let query = supabase.from('users').select('*')

      if (filter === 'suspended') {
        query = query.eq('isSuspended', true)
      } else if (filter === 'active') {
        query = query.eq('isSuspended', false)
      }

      const { data, error } = await query.order('createdAt', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (userId: string, isSuspended: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ isSuspended: !isSuspended })
        .eq('id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleResetCode = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ cashoutCode: '' })
        .eq('id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error resetting code:', error)
    }
  }

  const handleMakePartner = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'partner' })
        .eq('id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex gap-2">
          {['all', 'active', 'suspended'].map((f) => (
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
      ) : users.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{user.firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary-600">{user.points}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{user.tier}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isSuspended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSuspend(user.id, user.isSuspended)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                      >
                        <Lock size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleResetCode(user.id)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="Reset Cashout Code"
                      >
                        <RotateCcw size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleMakePartner(user.id)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="Make Partner"
                      >
                        <Shield size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  )
}
