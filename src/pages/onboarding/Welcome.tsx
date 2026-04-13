import { Link } from 'react-router-dom'
import { Heart, Star, ChevronRight, Shield, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { name: 'Health & Hygiene', emoji: '🩺', desc: 'Doctor visits, dental care, hygiene routines' },
  { name: 'Shelter & Safety', emoji: '🏠', desc: 'Staying at shelters, keeping spaces clean' },
  { name: 'Personal Growth', emoji: '📚', desc: 'Classes, job training, reading programs' },
  { name: 'Community', emoji: '🤝', desc: 'Volunteering, mentoring, group activities' },
  { name: 'Financial Steps', emoji: '💰', desc: 'Opening bank accounts, budgeting, saving' },
  { name: 'Daily Wellness', emoji: '🌅', desc: 'Morning routines, journaling, exercise' },
]

export default function WelcomePage() {
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % CATEGORIES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center space-y-10 py-4">

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Sparkles size={200} className="text-primary-400" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 rounded-full mb-6 shadow-lg animate-pulse">
            <Heart className="text-white" size={44} />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            OSAAT
          </h1>
          <p className="text-xl font-semibold text-primary-600 mb-1">
            One Step At A Time
          </p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            A behavioral progression platform that rewards real action with real cash
          </p>
        </div>
      </div>

      {/* Top Get Started CTA */}
      <div className="space-y-3">
        <Link
          to="/onboarding/create-account"
          className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          Get Started — It's Free
        </Link>
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-600 hover:text-accent-700 font-semibold">
            Sign In
          </Link>
        </p>
      </div>

      {/* Mission Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="text-primary-500" size={20} />
          <h2 className="font-bold text-gray-900 text-lg">Our Mission</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm">
          OSAAT partners with outreach centers and shelters to help individuals experiencing homelessness
          build momentum through <span className="font-semibold text-primary-600">small, verified actions</span>.
          Every step forward earns points. Points turn into <span className="font-semibold text-primary-600">real cash rewards</span>.
          No judgment. No hoops. Just progress.
        </p>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg mb-4">How It Works</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">1</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Take Real Actions</p>
              <p className="text-xs text-gray-500">Visit a doctor, attend a class, clean your space — 28 verified actions across 6 categories</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left">
            <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center font-bold text-accent-600 text-sm">2</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Earn Points</p>
              <p className="text-xs text-gray-500">Each action earns points based on effort. Upload proof or get partner verification.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left">
            <div className="flex-shrink-0 w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center font-bold text-warm-600 text-sm">3</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Cash Out</p>
              <p className="text-xs text-gray-500">100 points = $1. Cash out via CashApp or Venmo when you hit 500 points ($5).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Categories */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-5 border border-primary-100">
        <h2 className="font-bold text-gray-900 text-lg mb-1">6 Categories. 28 Actions.</h2>
        <p className="text-xs text-gray-500 mb-4">Something for everyone, no matter where you are in your journey.</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.name}
              className={`rounded-xl p-3 transition-all duration-500 ${
                i === activeCategory
                  ? 'bg-white shadow-md scale-105 border-2 border-primary-300'
                  : 'bg-white/60 border border-transparent'
              }`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <p className="text-2xs font-semibold text-gray-800 leading-tight">{cat.name}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 italic min-h-[2.5rem]">
          {CATEGORIES[activeCategory].desc}
        </p>
      </div>

      {/* For Outreach Partners */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-accent-100 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Star className="text-accent-500" size={20} />
          <h2 className="font-bold text-gray-900 text-lg">For Outreach Partners</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm mb-3">
          OSAAT gives your center a <span className="font-semibold text-accent-600">free digital tool</span> to
          incentivize participation, track engagement, and verify actions — all without extra staff burden.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0"></div>
            Verify participant actions with one tap
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0"></div>
            See real-time engagement dashboards
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0"></div>
            Built-in fraud prevention and ID verification
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0"></div>
            100% free for shelters and outreach centers
          </div>
        </div>
        <Link
          to="/partner-login"
          className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 font-semibold text-sm mt-4"
        >
          Partner Login <ChevronRight size={16} />
        </Link>
      </div>

      {/* Donation CTA */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
        <Heart className="text-rose-400 mx-auto mb-3" size={32} />
        <h2 className="font-bold text-gray-900 text-lg mb-2">Fund Someone's Fresh Start</h2>
        <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
          Every dollar you donate goes directly into the reward pot. That means real cash in the hands of people making real progress.
        </p>
        <a
          href="https://buy.stripe.com/14A4gydl08Et27I3mj9Ve00"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <Heart className="inline mr-2" size={18} />
          Donate Now
        </a>
        <p className="text-xs text-gray-400 mt-3">Secure payments powered by Stripe</p>
      </div>

      {/* Get Started CTA */}
      <div className="space-y-4 pt-2">
        <Link
          to="/onboarding/create-account"
          className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          Get Started — It's Free
        </Link>

        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-600 hover:text-accent-700 font-semibold">
            Sign In
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 pb-2 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Built with purpose. Powered by community.
        </p>
      </div>
    </div>
  )
}
