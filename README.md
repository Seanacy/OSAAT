# OSAAT - One Step At A Time

A complete React + TypeScript + Vite web application for behavioral progression and cash rewards targeting the transient/homeless community.

## Features

### User Dashboard
- Point balance tracking with tier progression
- Available actions feed filtered by tier
- Community pot display (WeStackr campaign)
- Pending verifications status
- Point sharing system
- Cashout requests

### Actions System
- 6 categories: Foundation, Health & Stability, Employment Prep, Employment Outcome, Community Contribution, Network Growth
- Multiple verification types: tap-to-complete, proof upload, document upload, email forward, partner portal, Stripe Identity
- Tier-locked actions
- Repeatable and one-time actions
- Real-time point calculation

### Cashout Flow
- Minimum 500 points, maximum 10,000 per request
- CashApp and Venmo payment methods
- Private cashout code requirement
- Request tracking and status management
- Deduction from community pot (78% available, 10% operations, 12% BridgeWork)

### Onboarding
- 5-step flow: Welcome, Create Account, Set Cashout Code, First Win, Dashboard
- Immediate point reward on first action
- Account setup with email or phone

### Admin Panel
- User management: view profiles, suspend/unsuspend, reset codes, change roles
- Verification queue: approve/reject submissions, view proof
- Cashout management: pending requests, code matching, status tracking
- Action management: create, edit, disable actions
- Partner management: add/remove, manage logins
- Analytics dashboard

### Partner Portal
- Separate login for verification partners
- View pending submissions to verify
- Approve/reject with one-click
- Cannot see full user profiles, cashout data, or post tasks
- Message admin

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build**: Vite
- **Icons**: Lucide React

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (already configured at: ygdfhbvhztxswkgxdjjt)

### Installation

1. Clone the repository
```bash
cd osaat-app
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file with Supabase credentials:
```
VITE_SUPABASE_URL=https://ygdfhbvhztxswkgxdjjt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. Start development server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Project Structure

```
osaat-app/
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx          # Mobile navigation
│   │   ├── PotDisplay.tsx         # Community pot info
│   │   └── ProtectedRoute.tsx     # Auth wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth state management
│   ├── layouts/
│   │   ├── AuthLayout.tsx         # Onboarding/login layout
│   │   └── MainLayout.tsx         # App layout with nav
│   ├── lib/
│   │   └── supabase.ts           # Supabase client + types
│   ├── pages/
│   │   ├── onboarding/           # 5-step onboarding flow
│   │   ├── auth/                 # Login page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Actions.tsx           # Actions list
│   │   ├── ActionDetail.tsx      # Action detail + submission
│   │   ├── Cashout.tsx           # Cashout flow
│   │   ├── PointSharing.tsx      # Point sharing
│   │   ├── Profile.tsx           # User profile
│   │   ├── admin/                # Admin panel (5 pages)
│   │   └── partner/              # Partner portal (2 pages)
│   ├── App.tsx                   # Router setup
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind imports
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## Database Schema

The app expects these tables in Supabase:

### users
- id (uuid)
- email (text)
- phone (text)
- firstName (text)
- nickname (text)
- points (integer)
- tier (integer)
- cashoutCode (text)
- role (text: 'user' | 'partner' | 'admin')
- isSuspended (boolean)
- createdAt (timestamp)
- lastLoginAt (timestamp)

### actions
- id (text)
- name (text)
- category (text)
- pointValue (integer)
- cashValue (numeric)
- minTierRequired (integer)
- isRepeatable (boolean)
- verificationType (text)
- isEnabled (boolean)
- createdAt (timestamp)

### user_actions
- id (uuid)
- userId (uuid)
- actionId (text)
- status (text: 'pending' | 'completed' | 'verified')
- completedAt (timestamp)
- verifiedAt (timestamp)
- proofUrl (text)
- notes (text)

### cashout_requests
- id (uuid)
- userId (uuid)
- points (integer)
- cashAmount (numeric)
- paymentMethod (text: 'cashapp' | 'venmo')
- code (text)
- status (text: 'pending' | 'sent' | 'completed')
- createdAt (timestamp)

### point_shares
- id (uuid)
- fromUserId (uuid)
- toUserId (uuid)
- points (integer)
- createdAt (timestamp)

### partner_messages
- id (uuid)
- message (text)
- createdAt (timestamp)

## Color Scheme

- **Primary (Green)**: Actions, points, success states
- **Accent (Blue)**: Navigation, secondary actions
- **Warm (Orange)**: Alerts, community content
- **Neutral (Gray)**: UI structure, text

## Design Principles

- **Mobile-first**: Bottom nav, large touch targets
- **Accessible**: Clear hierarchy, sufficient contrast
- **Warm & Hopeful**: Colors and language reflect dignity
- **Simple Navigation**: Intuitive flows for all users
- **Real-time Feedback**: Immediate point rewards, status updates

## Authentication Flow

1. Supabase Auth handles registration/login
2. Auth state stored in context
3. Protected routes redirect to login
4. Session persists across page reloads
5. Sign out clears session

## Point System

- Tier 1: 0-999 points
- Tier 2: 1,000-1,999 points
- Tier 3: 2,000+ points (continues incrementing)
- Progress bar shows points to next tier
- Immediate awards for tap-to-complete actions
- Pending verification for submitted actions

## Cashout Rules

- Minimum: 500 points
- Maximum: 10,000 per request
- Exchange rate: 100 points = $1
- Weekly share limit: 500 points
- Code required for security
- Status tracking: pending → sent → completed

## Development

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Deployment

The app is ready to deploy to:
- Vercel (recommended for Vite)
- Netlify
- Any static host

Set environment variables in your hosting platform with Supabase credentials.

## Support

For issues or questions, contact: support@osaat.app

## License

© 2024 OSAAT. All rights reserved.
