import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Bell, ArrowLeft, Check } from 'lucide-react'

interface Preferences {
  milestoneAlerts: boolean
  tierUpAlerts: boolean
  cashoutReady: boolean
  weeklyReminder: boolean
  pointThresholds: number[]
}

const DEFAULT_PREFS: Preferences = {
  milestoneAlerts: true,
  tierUpAlerts: true,
  cashoutReady: true,
  weeklyReminder: false,
  pointThresholds: [250, 500, 1000],
}

const THRESHOLD_OPTIONS = [100, 250, 500, 750, 1000, 2500, 5000, 10000]

export default function NotificationPreferencesPage() {
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [user?.id])

  const loadPreferences = async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('users')
        .select('notificationPrefs')
        .eq('id', user.id)
        .single()

      if (data?.notificationPrefs) {
        setPrefs({ ...DEFAULT_PREFS, ...data.notificationPrefs })
      }
    } catch (error) {
      // If column doesn't exist yet, use defaults
      console.log('Using default notification preferences')
    }
  }

  const savePreferences = async () => {
    if (!session?.user.id) return
    setSaving(true)
    try {
      await supabase
        .from('users')
        .update({ notificationPrefs: prefs })
        .eq('id', session.user.id)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleThreshold = (value: number) => {
    setPrefs(prev => ({
      ...prev,
      pointThresholds: prev.pointThresholds.includes(value)
        ? prev.pointThresholds.filter(t => t !== value)
        : [...prev.pointThresholds, value].sort((a, b) => a - b)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-8">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1 text-primary-100 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>
        <div className="flex items-center gap-3">
          <Bell size={28} />
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-primary-100 text-sm">Choose what you want to hear about</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Milestone Alerts */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-900">Point Milestones</h3>
              <p className="text-xs text-gray-500">Get notified when you hit a point goal</p>
            </div>
            <button
              onClick={() => setPrefs(p => ({ ...p, milestoneAlerts: !p.milestoneAlerts }))}
              className={`w-12 h-7 rounded-full transition-colors ${
                prefs.milestoneAlerts ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${
                prefs.milestoneAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {prefs.milestoneAlerts && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Notify me at these point levels:</p>
              <div className="flex flex-wrap gap-2">
                {THRESHOLD_OPTIONS.map(value => (
                  <button
                    key={value}
                    onClick={() => toggleThreshold(value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      prefs.pointThresholds.includes(value)
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                        : 'bg-gray-100 text-gray-500 border-2 border-transparent'
                    }`}
                  >
                    {value.toLocaleString()} pts
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tier Up Alerts */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Tier Upgrades</h3>
              <p className="text-xs text-gray-500">Get notified when you reach a new tier</p>
            </div>
            <button
              onClick={() => setPrefs(p => ({ ...p, tierUpAlerts: !p.tierUpAlerts }))}
              className={`w-12 h-7 rounded-full transition-colors ${
                prefs.tierUpAlerts ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${
                prefs.tierUpAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Cashout Ready */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Cashout Ready</h3>
              <p className="text-xs text-gray-500">Get notified when you can cash out (500+ points)</p>
            </div>
            <button
              onClick={() => setPrefs(p => ({ ...p, cashoutReady: !p.cashoutReady }))}
              className={`w-12 h-7 rounded-full transition-colors ${
                prefs.cashoutReady ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${
                prefs.cashoutReady ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Weekly Reminder */}
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Weekly Reminder</h3>
              <p className="text-xs text-gray-500">Remind me to check in each week</p>
            </div>
            <button
              onClick={() => setPrefs(p => ({ ...p, weeklyReminder: !p.weeklyReminder }))}
              className={`w-12 h-7 rounded-full transition-colors ${
                prefs.weeklyReminder ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${
                prefs.weeklyReminder ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={savePreferences}
          disabled={saving}
          className={`w-full font-bold py-3 px-4 rounded-lg transition-all text-lg ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={20} /> Saved!
            </span>
          ) : saving ? (
            'Saving...'
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  )
}
