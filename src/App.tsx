import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'

// Auth Pages
import WelcomePage from './pages/onboarding/Welcome'
import CreateAccountPage from './pages/onboarding/CreateAccount'
import CashoutCodePage from './pages/onboarding/CashoutCode'
import FirstWinPage from './pages/onboarding/FirstWin'
import LoginPage from './pages/auth/Login'

// Main Pages
import DashboardPage from './pages/Dashboard'
import ActionsPage from './pages/Actions'
import ActionDetailPage from './pages/ActionDetail'
import CashoutPage from './pages/Cashout'
import ProfilePage from './pages/Profile'
import PointSharingPage from './pages/PointSharing'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

// Partner Pages
import PartnerLogin from './pages/partner/PartnerLogin'
import PartnerDashboard from './pages/partner/PartnerDashboard'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-300 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/partner/login" element={<PartnerLogin />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Partner Routes */}
      <Route path="/partner/*" element={<PartnerDashboard />} />

      {/* Auth Routes */}
      {!session ? (
        <>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/onboarding/create-account" element={<CreateAccountPage />} />
            <Route path="/onboarding/cashout-code" element={<CashoutCodePage />} />
            <Route path="/onboarding/first-win" element={<FirstWinPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/actions/:id" element={<ActionDetailPage />} />
            <Route path="/cashout" element={<CashoutPage />} />
            <Route path="/point-sharing" element={<PointSharingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
