import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Users, CheckCircle2, DollarSign, Zap, Users2, LogOut } from 'lucide-react'
import AdminUsers from './AdminUsers'
import AdminVerifications from './AdminVerifications'
import AdminCashout from './AdminCashout'
import AdminActions from './AdminActions'
import AdminPartners from './AdminPartners'

export default function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCashouts: 0,
    pendingVerifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data: users } = await supabase.from('users').select('id')
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id')
        .gte('lastLoginAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const { data: cashouts } = await supabase.from('cashout_requests').select('id')
      const { data: pending } = await supabase
        .from('user_actions')
        .select('id')
        .eq('status', 'pending')

      setStats({
        totalUsers: users?.length || 0,
        activeUsers: activeUsers?.length || 0,
        totalCashouts: cashouts?.length || 0,
        pendingVerifications: pending?.length || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">OSAAT Admin</h1>

        <nav className="space-y-2 mb-8">
          <Link
            to="/admin/dashboard"
            className={`block px-4 py-2 rounded transition ${
              location.pathname === '/admin/dashboard'
                ? 'bg-gray-700'
                : 'hover:bg-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              isActive('/users') ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <Users size={18} />
            Users
          </Link>
          <Link
            to="/admin/verifications"
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              isActive('/verifications') ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <CheckCircle2 size={18} />
            Verifications
          </Link>
          <Link
            to="/admin/cashout"
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              isActive('/cashout') ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <DollarSign size={18} />
            Cashouts
          </Link>
          <Link
            to="/admin/actions"
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              isActive('/actions') ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <Zap size={18} />
            Actions
          </Link>
          <Link
            to="/admin/partners"
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              isActive('/partners') ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
          >
            <Users2 size={18} />
            Partners
          </Link>
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow">
                      <p className="text-gray-600 text-sm mb-2">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <p className="text-gray-600 text-sm mb-2">Active (7d)</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {stats.activeUsers}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <p className="text-gray-600 text-sm mb-2">Pending Verifications</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {stats.pendingVerifications}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow">
                      <p className="text-gray-600 text-sm mb-2">Cashout Requests</p>
                      <p className="text-3xl font-bold text-accent-600">
                        {stats.totalCashouts}
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-gray-500">
                    <p>Welcome to the admin dashboard. Use the navigation to manage your platform.</p>
                  </div>
                </div>
              )
            }
          />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/verifications" element={<AdminVerifications />} />
          <Route path="/cashout" element={<AdminCashout />} />
          <Route path="/actions" element={<AdminActions />} />
          <Route path="/partners" element={<AdminPartners />} />
        </Routes>
      </div>
    </div>
  )
}
