import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="text-center space-y-8">
      <div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-6">
          <Heart className="text-white" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          OSAAT
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          One Step At A Time
        </p>
        <p className="text-sm text-gray-500">
          Behavioral progression and cash rewards
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome! We believe in rewarding progress, no matter how small. Every action you take brings you closer to your goals and real cash rewards.
        </p>
        <p className="text-gray-600 text-sm">
          Start your journey today. One step at a time.
        </p>
      </div>

      <Link
        to="/onboarding/create-account"
        className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
      >
        Get Started
      </Link>

      <p className="text-gray-600 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-600 hover:text-accent-700 font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  )
}
