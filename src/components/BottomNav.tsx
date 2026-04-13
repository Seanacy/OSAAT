import { Link, useLocation } from 'react-router-dom'
import { Home, CheckCircle2, DollarSign, User } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl md:hidden">
      <div className="flex justify-around max-w-lg mx-auto">
        <Link
          to="/"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
            isActive('/dashboard') || location.pathname === '/'
              ? 'text-primary-600 border-t-2 border-primary-600'
              : 'text-gray-500'
          }`}
        >
          <Home size={24} />
          <span className="text-2xs mt-1">Home</span>
        </Link>

        <Link
          to="/actions"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
            isActive('/actions')
              ? 'text-primary-600 border-t-2 border-primary-600'
              : 'text-gray-500'
          }`}
        >
          <CheckCircle2 size={24} />
          <span className="text-2xs mt-1">Actions</span>
        </Link>

        <Link
          to="/cashout"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
            isActive('/cashout')
              ? 'text-primary-600 border-t-2 border-primary-600'
              : 'text-gray-500'
          }`}
        >
          <DollarSign size={24} />
          <span className="text-2xs mt-1">Cashout</span>
        </Link>

        <Link
          to="/profile"
          className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
            isActive('/profile')
              ? 'text-primary-600 border-t-2 border-primary-600'
              : 'text-gray-500'
          }`}
        >
          <User size={24} />
          <span className="text-2xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
