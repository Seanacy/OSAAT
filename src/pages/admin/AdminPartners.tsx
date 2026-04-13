import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

interface Partner {
  id: string
  firstName: string
  email: string
  role: string
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'partner')
        .order('firstName')

      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Sign up partner
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      // Create partner user record
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: authData.user?.id,
          email: formData.email,
          firstName: formData.firstName,
          role: 'partner',
          points: 0,
          tier: 1,
          isSuspended: false,
        },
      ])

      if (insertError) throw insertError

      setFormData({ firstName: '', email: '', password: '' })
      setShowForm(false)
      loadPartners()
    } catch (error) {
      console.error('Error creating partner:', error)
      alert('Failed to create partner')
    }
  }

  const handleRemove = async (partnerId: string) => {
    if (!confirm('Remove this partner?')) return
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', partnerId)

      if (error) throw error
      loadPartners()
    } catch (error) {
      console.error('Error removing partner:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Partners</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded transition"
        >
          <Plus size={20} />
          Add Partner
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-6 shadow mb-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 rounded transition"
            >
              Add Partner
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : partners.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {partner.firstName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{partner.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemove(partner.id)}
                      className="p-2 hover:bg-red-100 rounded transition"
                      title="Remove"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No partners yet. Add one to get started!
        </div>
      )}
    </div>
  )
}
