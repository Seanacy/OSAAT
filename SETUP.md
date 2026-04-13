# OSAAT App - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the project root:
```
VITE_SUPABASE_URL=https://ygdfhbvhztxswkgxdjjt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your anon key from Supabase dashboard:
- Go to https://app.supabase.com/
- Select project: ygdfhbvhztxswkgxdjjt
- Settings → API → Project API Keys → Copy "anon" key

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Database Setup

The app expects these tables in Supabase. Create them using the SQL editor:

### 1. Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  phone text UNIQUE,
  firstName text NOT NULL,
  nickname text,
  points integer DEFAULT 0,
  tier integer DEFAULT 1,
  cashoutCode text,
  role text DEFAULT 'user', -- 'user', 'partner', 'admin'
  isSuspended boolean DEFAULT false,
  createdAt timestamp DEFAULT now(),
  lastLoginAt timestamp
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Actions Table
```sql
CREATE TABLE actions (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL, -- Foundation, Health & Stability, Employment Prep, etc.
  pointValue integer NOT NULL,
  cashValue numeric NOT NULL,
  minTierRequired integer DEFAULT 1,
  isRepeatable boolean DEFAULT false,
  verificationType text NOT NULL, -- tap_to_complete, proof_upload, etc.
  isEnabled boolean DEFAULT true,
  createdAt timestamp DEFAULT now()
);

CREATE INDEX idx_actions_category ON actions(category);
CREATE INDEX idx_actions_enabled ON actions(isEnabled);
```

### 3. User Actions Table
```sql
CREATE TABLE user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES users(id),
  actionId text NOT NULL REFERENCES actions(id),
  status text NOT NULL, -- pending, completed, verified
  completedAt timestamp,
  verifiedAt timestamp,
  proofUrl text,
  notes text,
  createdAt timestamp DEFAULT now()
);

CREATE INDEX idx_user_actions_user ON user_actions(userId);
CREATE INDEX idx_user_actions_status ON user_actions(status);
CREATE INDEX idx_user_actions_action ON user_actions(actionId);
```

### 4. Cashout Requests Table
```sql
CREATE TABLE cashout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES users(id),
  points integer NOT NULL,
  cashAmount numeric NOT NULL,
  paymentMethod text NOT NULL, -- cashapp, venmo
  code text NOT NULL,
  status text NOT NULL, -- pending, sent, completed
  createdAt timestamp DEFAULT now()
);

CREATE INDEX idx_cashout_requests_user ON cashout_requests(userId);
CREATE INDEX idx_cashout_requests_status ON cashout_requests(status);
```

### 5. Point Shares Table
```sql
CREATE TABLE point_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fromUserId uuid NOT NULL REFERENCES users(id),
  toUserId uuid NOT NULL REFERENCES users(id),
  points integer NOT NULL,
  createdAt timestamp DEFAULT now()
);

CREATE INDEX idx_point_shares_from ON point_shares(fromUserId);
CREATE INDEX idx_point_shares_to ON point_shares(toUserId);
```

### 6. Partner Messages Table
```sql
CREATE TABLE partner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  createdAt timestamp DEFAULT now()
);
```

## Admin User Setup

To create your first admin user:

1. Sign up normally through the app (creates a user)
2. In Supabase SQL editor, run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@osaat.app';
```

Then sign in to `/admin/login` with those credentials.

## Sample Actions

Insert sample actions to get started:

```sql
INSERT INTO actions (id, name, category, pointValue, cashValue, minTierRequired, isRepeatable, verificationType) VALUES
('weekly-checkin', 'Weekly Check-In', 'Foundation', 100, 1.00, 1, true, 'tap_to_complete'),
('shower', 'Take a Shower', 'Health & Stability', 50, 0.50, 1, true, 'tap_to_complete'),
('doctor-visit', 'Visit Doctor', 'Health & Stability', 200, 2.00, 1, false, 'proof_upload'),
('resume', 'Complete Resume', 'Employment Prep', 300, 3.00, 1, false, 'document_upload'),
('interview-prep', 'Interview Prep Session', 'Employment Prep', 150, 1.50, 2, true, 'partner_portal'),
('job-applied', 'Apply for Job', 'Employment Outcome', 250, 2.50, 2, true, 'proof_upload'),
('volunteer', 'Volunteer Activity', 'Community Contribution', 200, 2.00, 1, true, 'partner_portal'),
('mentor', 'Mentor Someone', 'Network Growth', 300, 3.00, 3, true, 'mutual_app_confirmation');
```

## Testing Flows

### Test Onboarding
1. Go to http://localhost:5173/
2. Create account with test email
3. Set cashout code
4. Complete first win (tap button)
5. Should land on dashboard with 100 points

### Test Actions
1. Go to /actions
2. Click on an action
3. For tap-to-complete, click button and earn points
4. For upload types, upload file/paste content
5. Check dashboard for pending verifications

### Test Cashout
1. Go to /cashout
2. Enter points (min 500)
3. Select payment method
4. Enter code and submit
5. Check profile for pending requests

### Test Admin
1. Go to /admin/login
2. Sign in with admin account
3. View users, verifications, cashouts
4. Approve a pending verification
5. See points added to user

## Troubleshooting

### Environment Variables Not Loading
- Restart dev server after creating `.env.local`
- Variables must start with `VITE_` to be exposed to client

### Supabase Connection Issues
- Verify URL and key are correct
- Check Supabase project is active (not paused)
- Look at browser console for error details

### Auth Not Working
- Ensure Email/Password auth is enabled in Supabase
- Check user exists in users table
- Verify email is confirmed (if email verification required)

### Points Not Updating
- Check user_actions table has correct status
- Verify actions table has the action ID
- Admin must approve pending verifications first

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Next Steps

1. Customize colors in `tailwind.config.js`
2. Add your branding/logo
3. Update support email in Profile page
4. Configure payment method instructions
5. Deploy to Vercel or Netlify

## Support

For Supabase help: https://supabase.com/docs
For React help: https://react.dev
For Tailwind help: https://tailwindcss.com/docs
