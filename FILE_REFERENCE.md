# Project Files Complete Reference

## 📁 Full Project Structure

```
DTR/
│
├── 📄 Configuration Files
│   ├── package.json                 # Dependencies and scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.ts           # Tailwind CSS theme
│   ├── postcss.config.js            # PostCSS setup
│   ├── .gitignore                   # Git ignore patterns
│   ├── .env.local                   # Environment variables
│   ├── .env.example                 # Example env file
│   └── next-env.d.ts                # Next.js type definitions
│
├── 📚 Documentation Files (NEW)
│   ├── README.md                    # Full project documentation
│   ├── QUICKSTART.md                # Quick setup guide
│   ├── IMPLEMENTATION_SUMMARY.md    # What was implemented
│   ├── TESTING_CHECKLIST.md         # Testing guide
│   ├── ARCHITECTURE.md              # System architecture
│   └── dtr.html                     # Original HTML file (reference)
│
├── 🎨 App Files (app/)
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Home landing page (NEW)
│   ├── globals.css                  # Tailwind global styles
│   │
│   ├── api/auth/
│   │   ├── register/route.ts        # Registration API endpoint (NEW)
│   │   ├── login/route.ts           # Login API endpoint (NEW)
│   │   └── logout/route.ts          # Logout API endpoint (NEW)
│   │
│   ├── register/
│   │   └── page.tsx                 # Registration page (NEW)
│   │
│   ├── login/
│   │   └── page.tsx                 # Login page (NEW)
│   │
│   └── dashboard/
│       └── page.tsx                 # Main dashboard page (NEW)
│
├── 🧩 Components (components/)
│   ├── Entry.tsx                    # Time entry display component
│   ├── RegisterForm.tsx             # Registration form component (NEW)
│   └── LoginForm.tsx                # Login form component (NEW)
│
├── 🛠️ Utilities (lib/)
│   ├── utils.ts                     # Time calculation utilities
│   ├── auth.ts                      # Authentication helpers (NEW)
│   └── db.ts                        # Database connection (NEW)
│
├── 📝 Types (types/)
│   └── index.ts                     # TypeScript type definitions
│
└── 📦 Dependencies (installed)
    ├── react, react-dom             # UI library
    ├── next                         # React framework
    ├── tailwindcss                  # CSS framework
    ├── mysql2                       # MySQL driver (NEW)
    ├── bcryptjs                     # Password hashing (NEW)
    ├── jsonwebtoken                 # JWT authentication (NEW)
    └── typescript                   # Type support
```

## 📋 File Descriptions

### Configuration Files

**package.json**
- Dependencies: react, react-dom, next, mysql2, bcryptjs, jsonwebtoken
- DevDependencies: typescript, tailwindcss, postcss, autoprefixer, @types/...
- Scripts: dev, build, start, lint

**tsconfig.json**
- Target: ES2020
- Module: ESNext
- JSX: preserve
- Strict: true
- Module resolution: node

**next.config.js**
- React Strict Mode enabled

**tailwind.config.ts**
- Custom colors: bg, card, accent, muted
- Content paths configured

**postcss.config.js**
- Tailwind and Autoprefixer plugins

**.env.local**
- JWT_SECRET: JWT signing key
- DB_HOST: localhost
- DB_USER: root
- DB_PASSWORD: (empty for XAMPP)
- DB_NAME: dtr_db

### Page Files (app/)

**page.tsx** (/)
- Landing page with navigation
- Redirects logged-in users to dashboard
- Links to register and login pages

**register/page.tsx** (/register)
- Imports RegisterForm component
- Form for new user registration

**login/page.tsx** (/login)
- Imports LoginForm component
- Form for existing user login

**dashboard/page.tsx** (/dashboard)
- Protected route (checks localStorage for user)
- Displays time-in/out functionality
- Shows user's time entries
- Logout button

**layout.tsx**
- Root layout wrapper
- Sets up global styles
- Defines metadata

**globals.css**
- Tailwind imports (@tailwind directives)
- Custom component styles (@layer components)
- Input field styling
- Button variants

### API Routes (app/api/auth/)

**register/route.ts**
- POST endpoint
- Validates registration data
- Hashes password with bcryptjs
- Saves user to database
- Returns success or error

**login/route.ts**
- POST endpoint
- Validates credentials
- Compares password with hash
- Generates JWT token
- Sets HTTP-only cookie
- Returns user data

**logout/route.ts**
- POST endpoint
- Clears authentication cookie
- Returns success message

### Components (components/)

**RegisterForm.tsx**
- Form with fields: username, email, password, confirmPassword
- Validates input on client side
- Posts to /api/auth/register
- Shows error messages
- Redirects to login on success

**LoginForm.tsx**
- Form with fields: email, password
- Posts to /api/auth/login
- Shows error messages
- Saves user to localStorage
- Redirects to dashboard on success

**Entry.tsx**
- Displays individual time entry
- Shows: date, time in/out, hours worked, overtime, reason
- Edit mode: shows input fields
- Delete mode: shows confirmation
- Actions: Edit, Delete, Save

### Utilities (lib/)

**utils.ts**
- formatTime(date): converts Date to time string
- calculateHours(start, end): calculates hours between two dates
- calculateOvertime(hours): returns overtime if > 9 hours
- formatDateForInput(dateString): converts to YYYY-MM-DD format
- convertTimeToInput(timeStr): converts time format for input
- getStoredEntries(): retrieves entries from localStorage
- saveEntries(entries): saves entries to localStorage
- calculateTotalOvertime(entries): sums all overtime

**auth.ts**
- hashPassword(password): hashes password with bcryptjs
- comparePasswords(password, hash): verifies password
- generateToken(userId, email): creates JWT token
- verifyToken(token): validates JWT token

**db.ts**
- getConnection(): creates MySQL connection
- initializeDatabase(): creates database and tables if not exists

### Types (types/)

**index.ts**
```typescript
interface TimeEntry {
  date: string;
  rawDate: string;
  day: string;
  timeIn: string;
  timeOut: string;
  totalHours: number;
  overtime: number;
  reason?: string;
  isEditing?: boolean;
}
```

## 🔄 Data Flow Summary

```
User Registration
────────────────
1. RegisterForm (component) → validates input
2. POST /api/auth/register (API route)
3. Hash password (lib/auth.ts)
4. Save to users table (lib/db.ts)
5. Return success
6. Redirect to /login

User Login
──────────
1. LoginForm (component) → validates input
2. POST /api/auth/login (API route)
3. Query users table (lib/db.ts)
4. Compare password (lib/auth.ts)
5. Generate JWT token (lib/auth.ts)
6. Set cookie + return user
7. Save to localStorage
8. Redirect to /dashboard

Dashboard Time Tracking
───────────────────────
1. Page loads, checks localStorage for user
2. Load user's entries from localStorage
3. User clicks Time In/Out
4. Calculate hours (lib/utils.ts)
5. Display in Entry component
6. User can Edit/Delete/Save
7. Persist to localStorage
8. (Ready for DB integration)

Logout
──────
1. Click logout button
2. POST /api/auth/logout
3. Clear cookie
4. Clear localStorage
5. Redirect to /login
```

## 🎯 Key Features by File

| Feature | File(s) |
|---------|---------|
| User Registration | register/page.tsx, components/RegisterForm.tsx, app/api/auth/register/route.ts |
| User Login | login/page.tsx, components/LoginForm.tsx, app/api/auth/login/route.ts |
| Password Security | lib/auth.ts (bcryptjs hashing) |
| JWT Authentication | lib/auth.ts, app/api/auth/* |
| Time In/Out | app/dashboard/page.tsx, components/Entry.tsx |
| Time Calculation | lib/utils.ts (calculateHours, calculateOvertime) |
| Data Persistence | localStorage (client), MySQL (server - ready) |
| Database Connection | lib/db.ts, app/api/auth/* routes |
| UI Styling | globals.css, tailwind.config.ts, components |
| Type Safety | types/index.ts, all .tsx files |

## 📊 Database Schema Files

The database schema is created by:
1. `lib/db.ts` - contains initializeDatabase() function
2. Automatically runs on first app usage
3. Creates `dtr_db` database
4. Creates `users` and `time_entries` tables

## 🧪 Testing the Application

Refer to TESTING_CHECKLIST.md for:
- Setup verification
- User flow testing
- Database verification
- Error handling
- Performance checks

## 🚀 Deployment Notes

Files needed for production:
- ✅ All source files (app/, components/, lib/, types/)
- ✅ Configuration files (tsconfig.json, next.config.js, tailwind.config.ts)
- ✅ package.json with all dependencies
- ✅ Environment file (.env.local) with production values
- ⚠️ Update JWT_SECRET to strong random string
- ⚠️ Update MySQL credentials for production database

## 📝 Recent Changes (NEW Features)

Files created/modified for authentication:
- ✨ NEW: components/RegisterForm.tsx
- ✨ NEW: components/LoginForm.tsx
- ✨ NEW: app/register/page.tsx
- ✨ NEW: app/login/page.tsx
- ✨ NEW: app/dashboard/page.tsx
- ✨ NEW: app/api/auth/register/route.ts
- ✨ NEW: app/api/auth/login/route.ts
- ✨ NEW: app/api/auth/logout/route.ts
- ✨ NEW: lib/auth.ts
- ✨ NEW: lib/db.ts
- ✨ MODIFIED: app/page.tsx (home landing page)
- ✨ MODIFIED: package.json (added mysql2, bcryptjs, jsonwebtoken)
- ✨ MODIFIED: .env.local (database config)

---

**Project Status**: ✅ Ready for Development
**Last Updated**: 2025-11-14
**Version**: 1.1.0 (with Authentication)
