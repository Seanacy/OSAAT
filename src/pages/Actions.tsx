import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Lock, Zap, ChevronRight } from 'lucide-react'

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

const CATEGORIES = [
  'Foundation',
  'Health & Stability',
  'Employment Prep',
  'Employment Outcome',
  'Community Contribution',
  'Network Growth',
]

export default function ActionsPage() {
  const { user } = useAuth()
  const [actions, setActions] = useState<Action[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Foundation')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActions()
  }, [user?.id])

  const loadActions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('isEnabled', true)
        .order('pointValue', { ascending: false })

      if (error) throw error
      setActions(data || [])
    } catch (error) {
      console.error('Error loading actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActions = actions.filter((action) => action.category === selectedCategory)
  const currentTier = (user?.tier || 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-300 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 pb-8">
        <h1 className="text-3xl font-bold">Actions</h1>
        <p className="text-accent-100 mt-1">Complete tasks and earn rewards</p>
      </div>

      <div className="p-4 pb-24">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-accent-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Actions List */}
        {filteredActions.length > 0 ? (
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const isLocked = action.minTierRequired > currentTier

              return (
                <Link
                  key={action.id}
                  to={isLocked ? '#' : `/actions/${action.id}`}
                  className={`block rounded-lg p-4 transition ${
                    isLocked
                      ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:shadow-md border border-gray-200'
                  }`}
                  onClick={(e) => {
                    if (isLocked) e.preventDefault()
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isLocked && <Lock size={16} className="text-gray-400 flex-shrink-0" />}
                        <h3 className="font-bold text-gray-900">{action.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {action.isRepeatable ? 'Repeatable' : 'One-time'} • {action.verificationType.replace(/_/g, ' ')}
                      </p>

                      <div className="flex gap-3 text-sm">
                        <div className="flex items-center gap-1 text-primary-600 font-semibold">
                          <Zap size={14} />
                          {action.pointValue} points
                        </div>
                        {action.cashValue > 0 && (
                          <div className="text-accent-600 font-semibold">
                            ${action.cashValue}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Unlock at</div>
                          <div className="font-semibold text-gray-700">Tier {action.minTierRequired}</div>
                        </div>
                      ) : (
                        <ChevronRight className="text-gray-400" size={20} />
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No actions in this category yet</p>
            <p className="text-sm text-gray-400">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
