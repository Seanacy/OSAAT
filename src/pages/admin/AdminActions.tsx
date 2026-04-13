import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Check } from 'lucide-react'

interface Action {
  id: string
  name: string
  category: string
  pointValue: number
  cashValue: number
  minTierRequired: number
  isRepeatable: boolean
  verificationType: string
  isEnabled: boolean
}

export default function AdminActions() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Foundation',
    pointValue: 100,
    cashValue: 1,
    minTierRequired: 1,
    isRepeatable: false,
    verificationType: 'tap_to_complete',
  })

  useEffect(() => {
    loadActions()
  }, [])

  const loadActions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('category')

      if (error) throw error
      setActions(data || [])
    } catch (error) {
      console.error('Error loading actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('actions').insert([
        {
          ...formData,
          id: `action-${Date.now()}`,
        },
      ])

      if (error) throw error

      setFormData({
        name: '',
        category: 'Foundation',
        pointValue: 100,
        cashValue: 1,
        minTierRequired: 1,
        isRepeatable: false,
        verificationType: 'tap_to_complete',
      })
      setShowForm(false)
      loadActions()
    } catch (error) {
      console.error('Error creating action:', error)
    }
  }

  const handleToggle = async (actionId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('actions')
        .update({ isEnabled: !isEnabled })
        .eq('id', actionId)

      if (error) throw error
      loadActions()
    } catch (error) {
      console.error('Error toggling action:', error)
    }
  }

  const handleDelete = async (actionId: string) => {
    if (!confirm('Delete this action?')) return
    try {
      const { error } = await supabase.from('actions').delete().eq('id', actionId)
      if (error) throw error
      loadActions()
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Actions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded transition"
        >
          <Plus size={20} />
          New Action
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
              placeholder="Action name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
            >
              <option>Foundation</option>
              <option>Health & Stability</option>
              <option>Employment Prep</option>
              <option>Employment Outcome</option>
              <option>Community Contribution</option>
              <option>Network Growth</option>
            </select>

            <input
              type="number"
              placeholder="Point value"
              value={formData.pointValue}
              onChange={(e) => setFormData({ ...formData, pointValue: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />

            <input
              type="number"
              placeholder="Cash value ($)"
              value={formData.cashValue}
              onChange={(e) => setFormData({ ...formData, cashValue: parseFloat(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              step="0.01"
              required
            />

            <select
              value={formData.verificationType}
              onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
            >
              <option value="tap_to_complete">Tap to Complete</option>
              <option value="proof_upload">Proof Upload</option>
              <option value="document_upload">Document Upload</option>
              <option value="email_forward">Email Forward</option>
              <option value="partner_portal">Partner Portal</option>
              <option value="stripe_identity">Stripe Identity</option>
            </select>

            <input
              type="number"
              placeholder="Min tier required"
              value={formData.minTierRequired}
              onChange={(e) => setFormData({ ...formData, minTierRequired: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isRepeatable}
              onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
            />
            <span>Repeatable</span>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 rounded transition"
            >
              Create Action
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
      ) : actions.length > 0 ? (
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{action.name}</p>
                  <p className="text-sm text-gray-600">{action.category}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.pointValue} pts • ${action.cashValue} • Tier {action.minTierRequired}+
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(action.id, action.isEnabled)}
                    className={`p-2 rounded transition ${
                      action.isEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={action.isEnabled ? 'Disable' : 'Enable'}
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(action.id)}
                    className="p-2 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No actions. Create one to get started!
        </div>
      )}
    </div>
  )
}
