import { Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const location = useLocation()
  const isWelcome = location.pathname === '/' || location.pathname === '/welcome'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-warm-50 flex flex-col">
      <div className={`flex-1 flex ${isWelcome ? 'items-start' : 'items-center'} justify-center p-4`}>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
