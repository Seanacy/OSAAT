import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TrendingUp, Users, ShieldCheck, Zap, DollarSign, Calendar } from 'lucide-react'

interface DayStat {
  date: string
  count: number
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7')
  const [stats, setStats] = useState({
    newSignups: [] as DayStat[],
    actionsCompleted: [] as DayStat[],
    idVerifications: [] as DayStat[],
    cashoutRequests: [] as DayStat[],
    totalSignups: 0,
    totalActions: 0,
    totalVerifications: 0,
    totalCashouts: 0,
    totalPointsAwarded: 0,
    totalCashedOut: 0,
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange))
      const since = daysAgo.toISOString()

      // New signups in range
      const { data: signups } = await supabase
        .from('users')
        .select('createdAt')
        .gte('createdAt', since)

      // Actions completed in range
      const { data: actions } = await supabase
        .from('user_actions')
        .select('completedAt, actionId, status')
        .gte('completedAt', since)
        .eq('status', 'completed')

      // ID verifications (stripe_identity actions)
      const { data: verifications } = await supabase
        .from('user_actions')
        .select('completedAt, actionId, status')
        .gte('completedAt', since)
        .in('actionId', ['get-state-id', 'get-birth-certificate', 'get-social-security'])

      // Cashout requests in range
      const { data: cashouts } = await supabase
        .from('cashout_requests')
        .select('createdAt, pointsRequested, status')
        .gte('createdAt', since)

      // Total points across all users
      const { data: allUsers } = await supabase
        .from('users')
        .select('points')

      const totalPointsAwarded = allUsers?.reduce((sum, u) => sum + (u.points || 0), 0) || 0

      // Total cashed out
      const totalCashedOut = cashouts
        ?.filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.pointsRequested || 0), 0) || 0

      // Group by day helper
      const groupByDay = (items: any[], dateField: string): DayStat[] => {
        const map: Record<string, number> = {}
        const days = parseInt(dateRange)
        for (let i = 0; i < days; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          map[key] = 0
        }
        items?.forEach(item => {
          if (item[dateField]) {
            const key = item[dateField].split('T')[0]
            if (map[key] !== undefined) map[key]++
          }
        })
        return Object.entries(map)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count }))
      }

      setStats({
        newSignups: groupByDay(signups || [], 'createdAt'),
        actionsCompleted: groupByDay(actions || [], 'completedAt'),
        idVerifications: groupByDay(verifications || [], 'completedAt'),
        cashoutRequests: groupByDay(cashouts || [], 'createdAt'),
        totalSignups: signups?.length || 0,
        totalActions: actions?.length || 0,
        totalVerifications: verifications?.length || 0,
        totalCashouts: cashouts?.length || 0,
        totalPointsAwarded,
        totalCashedOut,
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxCount = (data: DayStat[]) => Math.max(...data.map(d => d.count), 1)

  const BarChart = ({ data, color }: { data: DayStat[]; color: string }) => {
    const max = maxCount(data)
    return (
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t ${color} transition-all duration-300`}
              style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
              title={`${d.date}: ${d.count}`}
            />
            {data.length <= 14 && (
              <span className="text-2xs text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-300 border-t-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                dateRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {range}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-primary-500" />
            <p className="text-gray-500 text-xs">New Signups</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSignups}</p>
          <p className="text-xs text-gray-400">last {dateRange} days</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-accent-500">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-accent-500" />
            <p className="text-gray-500 text-xs">Actions Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
          <p className="text-xs text-gray-400">last {dateRange} days</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-amber-500" />
            <p className="text-gray-500 text-xs">ID Verifications</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVerifications}</p>
          <p className="text-xs text-gray-400">last {dateRange} days</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-rose-500">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-rose-500" />
            <p className="text-gray-500 text-xs">Cashout Requests</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCashouts}</p>
          <p className="text-xs text-gray-400">last {dateRange} days</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <p className="text-gray-500 text-xs">Total Points Awarded</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPointsAwarded.toLocaleString()}</p>
          <p className="text-xs text-gray-400">all time</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-purple-500" />
            <p className="text-gray-500 text-xs">Points Cashed Out</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCashedOut.toLocaleString()}</p>
          <p className="text-xs text-gray-400">${(stats.totalCashedOut / 100).toFixed(2)} value</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-bold text-gray-900 mb-4">New Signups</h3>
          <BarChart data={stats.newSignups} color="bg-primary-400" />
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-bold text-gray-900 mb-4">Actions Completed</h3>
          <BarChart data={stats.actionsCompleted} color="bg-accent-400" />
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-bold text-gray-900 mb-4">ID Verifications</h3>
          <BarChart data={stats.idVerifications} color="bg-amber-400" />
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="font-bold text-gray-900 mb-4">Cashout Requests</h3>
          <BarChart data={stats.cashoutRequests} color="bg-rose-400" />
        </div>
      </div>
    </div>
  )
}
