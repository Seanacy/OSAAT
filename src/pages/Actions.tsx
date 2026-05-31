import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Lock, Zap, ChevronRight, CheckCircle2, Link2, Star } from 'lucide-react'

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
  priority: number
  choiceGroupId: string | null
  choiceGroupMinRequired: number | null
  sideNote: string | null
  mandatory: boolean
}

// Tier tabs shown at the top of the page.
// `dbTiers` = which minTierRequired values from the DB belong to this tab.
const TIERS: { tier: number; dbTiers: number[]; name: string }[] = [
  { tier: 1, dbTiers: [0, 1], name: 'Foundation' },
  { tier: 2, dbTiers: [2], name: 'Employment' },
  { tier: 3, dbTiers: [3], name: 'Sobriety' },
]

// Extra$$$ pays 75% of the original points, rounded to the nearest 50.
function extraPoints(p: number): number {
  return Math.round((p * 0.75) / 50) * 50
}

// Tiny category labels shown under each action name
const CATEGORY_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  health_stability: 'Health & Stability',
  employment_prep: 'Employment Prep',
  employment_outcome: 'Employment Outcome',
  community_contribution: 'Community',
  network_growth: 'Network Growth',
}

// Group labels shown as badges on action cards
const GROUP_LABELS: Record<string, string> = {
  secondary_id: 'Second ID option (pick 1)',
  contact: 'Contact option (bonus pair)',
  job_search: 'Job Search option (pick 1)',
  resume: 'Resume option (pick 1)',
}

// Choice groups where completing ANY ONE is required to graduate that tier.
// Items in these groups are NOT individually mandatory, but the GROUP is.
const MANDATORY_CHOICE_GROUPS: Set<string> = new Set([
  'secondary_id', // Tier 1: Birth Cert OR SS Card
  'job_search',   // Tier 2: Indeed OR Monster
  'resume',       // Tier 2: Create OR Revamp resume
])

// Short descriptor shown ABOVE the red "Mandatory to graduate" badge,
// telling the user what kind of choice this pick-1 group represents.
const GROUP_DESCRIPTORS: Record<string, string> = {
  secondary_id: 'Second form of identification',
  contact: 'Form of communication',
  job_search: 'Job search platform',
  resume: 'Resume preparation',
}

// Map a DB minTier value -> the tier number we show in the UI
function uiTierForDbTier(dbTier: number): number {
  const found = TIERS.find((t) => t.dbTiers.includes(dbTier))
  return found ? found.tier : dbTier
}

export default function ActionsPage() {
  const { user } = useAuth()
  const [actions, setActions] = useState<Action[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [searchParams] = useSearchParams()
  // selectedTab can be 1, 2, 3 (regular tiers) or 'extras'
  const [selectedTab, setSelectedTab] = useState<number | 'extras'>(
    searchParams.get('tab') === 'extras' ? 'extras' : 1
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActions()
  }, [user?.id])

  const loadActions = async () => {
    setLoading(true)
    try {
      const { data: actionsData, error } = await supabase
        .from('osaat_actions')
        .select('*')
        .eq('isEnabled', true)
        .order('priority', { ascending: true })

      if (error) throw error
      setActions(actionsData || [])

      if (user?.id) {
        const { data: completed } = await supabase
          .from('osaat_user_actions')
          .select('actionId')
          .eq('userId', user.id)
          .eq('status', 'completed')
        setCompletedIds(new Set((completed || []).map((c: any) => c.actionId)))
      }
    } catch (error) {
      console.error('Error loading actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTier = user?.tier || 1
  const extrasUnlocked = currentTier >= 3

  // Choice-group satisfaction (pick-1)
  const satisfiedPickOneGroups = new Set<string>()
  const groupCompletedCount: Record<string, number> = {}
  for (const a of actions) {
    if (!a.choiceGroupId) continue
    if (completedIds.has(a.id)) {
      groupCompletedCount[a.choiceGroupId] = (groupCompletedCount[a.choiceGroupId] || 0) + 1
    }
  }
  for (const a of actions) {
    if (a.choiceGroupId && a.choiceGroupMinRequired != null) {
      const done = groupCompletedCount[a.choiceGroupId] || 0
      if (done >= a.choiceGroupMinRequired) satisfiedPickOneGroups.add(a.choiceGroupId)
    }
  }

  // Build the visible action list for the selected tab.
  // For Extra$$$: show only items the user SKIPPED in lower tiers
  // (not completed, not satisfied by a pick-1 sibling, and from a tier
  // BELOW the user's current tier — they passed it without finishing it).
  let filteredActions: Action[] = []
  if (selectedTab === 'extras') {
    filteredActions = actions.filter((a) => {
      if (completedIds.has(a.id)) return false
      // Only items from tiers the user already passed.
      // currentTier = user.tier; show items from tiers strictly below.
      const itemUiTier = uiTierForDbTier(a.minTierRequired)
      if (itemUiTier >= currentTier) return false
      // Skip items where the pick-1 group is already satisfied.
      if (
        a.choiceGroupId &&
        a.choiceGroupMinRequired != null &&
        satisfiedPickOneGroups.has(a.choiceGroupId)
      ) {
        return false
      }
      return true
    })
    // Chronological = same order they appeared in their tier (priority asc)
    filteredActions.sort((a, b) => a.priority - b.priority)
  } else {
    const tabConfig = TIERS.find((t) => t.tier === selectedTab) || TIERS[0]
    filteredActions = actions.filter((a) => tabConfig.dbTiers.includes(a.minTierRequired))
  }

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
        {/* Tier Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TIERS.map((t) => {
            const selected = selectedTab === t.tier
            return (
              <button
                key={t.tier}
                onClick={() => setSelectedTab(t.tier)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition text-left leading-tight ${
                  selected
                    ? 'bg-accent-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <div className="text-sm font-bold">Tier {t.tier}</div>
                <div className={`text-[10px] font-normal ${selected ? 'text-accent-100' : 'text-gray-500'}`}>
                  {t.name}
                </div>
              </button>
            )
          })}
          {/* Extra$$$ tab */}
          <button
            onClick={() => extrasUnlocked && setSelectedTab('extras')}
            disabled={!extrasUnlocked}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition text-left leading-tight ${
              selectedTab === 'extras'
                ? 'bg-green-600 text-white'
                : extrasUnlocked
                ? 'bg-white text-gray-700 border border-gray-200'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
            title={extrasUnlocked ? '' : 'Unlocks at Tier 3'}
          >
            <div className="text-sm font-bold flex items-center gap-1">
              {!extrasUnlocked && <Lock size={12} />}
              Extra$$$
            </div>
            <div
              className={`text-[10px] font-normal ${
                selectedTab === 'extras'
                  ? 'text-green-100'
                  : extrasUnlocked
                  ? 'text-gray-500'
                  : 'text-gray-400'
              }`}
            >
              {extrasUnlocked ? 'Catch-up bonus' : 'Unlocks at Tier 3'}
            </div>
          </button>
        </div>

        {/* Extras intro banner */}
        {selectedTab === 'extras' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-900 font-semibold mb-1">
              💰 Catch-up bonus
            </p>
            <p className="text-xs text-green-800">
              These are items you skipped from earlier tiers. You can still complete them for points — but they pay 75% of the original value.
            </p>
          </div>
        )}

        {/* Actions List */}
        {filteredActions.length > 0 ? (
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const inExtras = selectedTab === 'extras'
              const isCompleted = completedIds.has(action.id)
              const isTierLocked = !inExtras && action.minTierRequired > currentTier
              const isGroupSatisfied =
                !!action.choiceGroupId &&
                !isCompleted &&
                satisfiedPickOneGroups.has(action.choiceGroupId)
              const isDisabled = isTierLocked || isGroupSatisfied || isCompleted
              const groupLabel = action.choiceGroupId ? GROUP_LABELS[action.choiceGroupId] : null
              const uiTier = uiTierForDbTier(action.minTierRequired)
              const categoryLabel = CATEGORY_LABELS[action.category] || action.category
              const displayPoints = inExtras ? extraPoints(action.pointValue) : action.pointValue
              const linkTarget = inExtras
                ? `/actions/${action.id}?from=extras`
                : `/actions/${action.id}`

              return (
                <Link
                  key={action.id}
                  to={isDisabled ? '#' : linkTarget}
                  className={`block rounded-lg p-4 transition ${
                    isDisabled
                      ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:shadow-md border border-gray-200'
                  }`}
                  onClick={(e) => {
                    if (isDisabled) e.preventDefault()
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Tier + category tag */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-accent-700 bg-accent-50 border border-accent-100 rounded-full px-2 py-0.5">
                          {inExtras ? `From Tier ${uiTier}` : `Tier ${uiTier}`}
                          <span className="font-normal text-accent-600 normal-case tracking-normal">· {categoryLabel}</span>
                        </div>
                        {inExtras && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            Extra$$$ · 75%
                          </div>
                        )}
                        {!inExtras && action.mandatory && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            <Star size={11} className="fill-red-600 text-red-600" />
                            Mandatory for Tier {uiTier} Completion
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        {isCompleted && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />}
                        {isTierLocked && !isCompleted && <Lock size={16} className="text-gray-400 flex-shrink-0" />}
                        <h3 className="font-bold text-gray-900">{action.name}</h3>
                      </div>

                      {groupLabel && (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1 mb-1">
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 bg-primary-50 border border-primary-100 rounded-full px-2 py-0.5">
                              <Link2 size={11} />
                              {groupLabel}
                            </div>
                          </div>
                          {!inExtras &&
                            action.choiceGroupId &&
                            MANDATORY_CHOICE_GROUPS.has(action.choiceGroupId) && (
                              <>
                                {GROUP_DESCRIPTORS[action.choiceGroupId] && (
                                  <p className="text-xs text-gray-700 font-semibold mb-1">
                                    {GROUP_DESCRIPTORS[action.choiceGroupId]}
                                  </p>
                                )}
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                                  <Star size={11} className="fill-red-600 text-red-600" />
                                  Pick 1 — Mandatory to graduate Tier {uiTier}
                                </div>
                              </>
                            )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mb-2">
                        {action.isRepeatable ? 'Repeatable' : 'One-time'} • {action.verificationType.replace(/_/g, ' ')}
                      </p>

                      {action.sideNote && (
                        <p className="text-xs italic text-gray-600 mb-2">ℹ️ {action.sideNote}</p>
                      )}

                      <div className="flex gap-3 text-sm flex-wrap items-center">
                        <div className="flex items-center gap-1 text-primary-600 font-semibold">
                          <Zap size={14} />
                          {displayPoints} points
                          {inExtras && (
                            <span className="text-[10px] text-gray-400 font-normal line-through ml-1">
                              {action.pointValue}
                            </span>
                          )}
                        </div>
                        {action.cashValue > 0 && (
                          <div className="text-accent-600 font-semibold">${action.cashValue}</div>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-green-600 font-semibold">Completed</span>
                        )}
                        {isGroupSatisfied && !isCompleted && (
                          <span className="text-xs text-gray-500 font-semibold">Already satisfied</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isTierLocked ? (
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Unlock at</div>
                          <div className="font-semibold text-gray-700">Tier {uiTier}</div>
                        </div>
                      ) : isDisabled ? null : (
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
            {selectedTab === 'extras' ? (
              <>
                <p className="text-gray-500 mb-2">No extras yet 🎉</p>
                <p className="text-sm text-gray-400">
                  You haven't skipped any items from earlier tiers. Nice work.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-2">No actions in this tier yet</p>
                <p className="text-sm text-gray-400">Check back soon!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
