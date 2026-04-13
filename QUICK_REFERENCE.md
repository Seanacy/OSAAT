# OSAAT App - Quick Reference Guide

## Getting Started (60 seconds)

```bash
# 1. Navigate to project
cd /sessions/amazing-modest-turing/osaat-app

# 2. Install dependencies
npm install

# 3. Create .env.local with:
VITE_SUPABASE_URL=https://ygdfhbvhztxswkgxdjjt.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

# 4. Start development
npm run dev

# 5. Open browser
# http://localhost:5173
```

## Main Routes

### Public Routes
- `/` - Welcome screen
- `/login` - User login
- `/admin/login` - Admin login
- `/partner/login` - Partner login

### Onboarding (Protected)
- `/onboarding/create-account`
- `/onboarding/cashout-code`
- `/onboarding/first-win`

### User Routes (Protected)
- `/` or `/dashboard` - Main dashboard
- `/actions` - Actions list
- `/actions/:id` - Action detail + submit
- `/cashout` - Cashout requests
- `/point-sharing` - Share points
- `/profile` - User profile

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Stats overview
- `/admin/users` - User management
- `/admin/verifications` - Approve submissions
- `/admin/cashout` - Track cashouts
- `/admin/actions` - Manage actions
- `/admin/partners` - Manage partners

### Partner Routes
- `/partner/login` - Partner login
- `/partner/dashboard` - Verify submissions

## Key Components

### BottomNav
Located: `src/components/BottomNav.tsx`
Displays on all main app pages. 4 tabs:
- Home (Dashboard)
- Actions
- Cashout
- Profile

### PotDisplay
Located: `src/components/PotDisplay.tsx`
Shows community pot breakdown:
- Total Raised
- Operations (10%)
- BridgeWork Fund (12%)
- Available Cashout (78%)

### AuthContext
Located: `src/contexts/AuthContext.tsx`
Methods:
- `signUp(email, password, firstName)`
- `signIn(email, password)`
- `signOut()`
- Access: `const { user, session, loading } = useAuth()`

### Supabase Client
Located: `src/lib/supabase.ts`
Initialize: `import { supabase } from '../lib/supabase'`

## Common Tasks

### Add a New Page
1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link where needed

### Connect to Supabase
```typescript
import { supabase } from '../lib/supabase'

const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

### Check User Authentication
```typescript
import { useAuth } from '../contexts/AuthContext'

export default function MyComponent() {
  const { session, user, loading } = useAuth()
  
  if (!session) return <Navigate to="/login" />
  if (loading) return <Loading />
  
  return <div>{user?.firstName}</div>
}
```

### Update User Points
```typescript
const { error } = await supabase
  .from('users')
  .update({ points: newPoints })
  .eq('id', userId)
```

### Create Action Record
```typescript
const { error } = await supabase
  .from('user_actions')
  .insert([{
    userId: session?.user.id,
    actionId: action.id,
    status: 'pending',
    completedAt: new Date().toISOString(),
  }])
```

## Important Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | All routes defined here |
| `src/contexts/AuthContext.tsx` | Auth state & Supabase |
| `src/lib/supabase.ts` | Supabase client setup |
| `tailwind.config.js` | Color theme customization |
| `package.json` | Dependencies & scripts |
| `vite.config.ts` | Build configuration |

## Database Tables

### users
```
id, email, phone, firstName, nickname
points, tier, cashoutCode, role, isSuspended
createdAt, lastLoginAt
```

### actions
```
id, name, category, pointValue, cashValue
minTierRequired, isRepeatable, verificationType, isEnabled
```

### user_actions
```
id, userId, actionId, status
completedAt, verifiedAt, proofUrl, notes
```

### cashout_requests
```
id, userId, points, cashAmount
paymentMethod, code, status, createdAt
```

### point_shares
```
id, fromUserId, toUserId, points, createdAt
```

## Testing Checklist

- [ ] Create account
- [ ] Set cashout code
- [ ] Complete first action (100 pts)
- [ ] View dashboard
- [ ] Browse actions
- [ ] Submit action
- [ ] Check pending verification
- [ ] Share points with user
- [ ] Request cashout
- [ ] Login as admin
- [ ] Approve verification
- [ ] Track cashout
- [ ] Login as partner
- [ ] Approve submission

## Styling

### Colors
```css
primary-600: #16a34a (green) - actions, points
accent-600: #0284c7 (blue) - navigation
warm-600: #b45309 (orange) - alerts
gray-900: #111827 (dark) - text
```

### Tailwind Classes
- Use `px-4 py-3` for standard padding
- Use `rounded-lg` for corners
- Use `shadow-sm` or `shadow-md` for depth
- Use `transition` for smooth animations
- Use `gap-2` or `gap-4` for spacing

### Forms
- Use full width: `w-full`
- Standard input: `px-4 py-3 border border-gray-300 rounded-lg`
- Focus ring: `focus:ring-2 focus:ring-primary-500 focus:border-transparent`

## NPM Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://ygdfhbvhztxswkgxdjjt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Browser DevTools Tips

1. **Network Tab**: Check API calls to Supabase
2. **Console**: Watch for auth errors
3. **Application**: Check localStorage for auth token
4. **React DevTools**: Inspect component state

## Troubleshooting

### App won't start
- `rm -rf node_modules && npm install`
- Check `.env.local` exists with correct keys
- Check Supabase project is accessible

### Auth not working
- Verify Supabase credentials
- Check auth table exists
- Check user email is confirmed (if required)

### Points not updating
- Check user_actions table in Supabase
- Verify admin approved verification
- Check action ID exists

### Bottom nav not showing
- Only shows on screens with `MainLayout`
- Check route is wrapped in `<Route element={<MainLayout />}>`

## Deployment

### Vercel (Recommended)
```bash
# Link to Vercel
vercel

# Add env vars in Vercel dashboard:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Deploy
vercel --prod
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
# Add env vars in Netlify settings
```

## Resources

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev/guide

## Support

- Check README.md for full documentation
- Check SETUP.md for detailed setup
- Check PROJECT_SUMMARY.md for feature overview
- Check FILES_MANIFEST.md for file listing

---

**Last Updated**: April 2026
**Version**: 1.0.0
