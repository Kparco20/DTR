# DTR Application - Visual Architecture & Data Flow

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXT.JS CLIENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                │
│  │   Home   │→ │ Register │→ │   Login      │                │
│  │  Page    │  │  Form    │  │   Form       │                │
│  └──────────┘  └──────────┘  └──────────────┘                │
│                                      ↓                        │
│                            ┌─────────────────┐                │
│                            │   Dashboard     │                │
│                            │  (Protected)    │                │
│                            │                 │                │
│                            │ • Time In/Out   │                │
│                            │ • Submit Entry  │                │
│                            │ • Edit/Delete   │                │
│                            │ • Logout        │                │
│                            └─────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                          ↓                  ↓
    POST /api/auth/         POST /api/auth/      localStorage
    register                login
         ↓                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/auth/register  → Validate → Hash Password → Save User  │
│                                                               │
│  /api/auth/login     → Validate → Compare → Generate JWT     │
│                                                               │
│  /api/auth/logout    → Clear Cookie                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│               XAMPP MySQL DATABASE (dtr_db)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌─────────────────────────────┐  │
│  │    users table       │  │  time_entries table         │  │
│  ├──────────────────────┤  ├─────────────────────────────┤  │
│  │ • id (PK)           │  │ • id (PK)                   │  │
│  │ • username (UNIQUE) │  │ • user_id (FK) → users.id  │  │
│  │ • email (UNIQUE)    │  │ • date                      │  │
│  │ • password (HASH)   │  │ • time_in                   │  │
│  │ • created_at        │  │ • time_out                  │  │
│  │                     │  │ • total_hours               │  │
│  │                     │  │ • overtime                  │  │
│  │                     │  │ • reason                    │  │
│  │                     │  │ • created_at                │  │
│  └──────────────────────┘  └─────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📊 User Authentication Flow

```
USER REGISTRATION
─────────────────────────────────────────────────────────────
1. User visits / → clicks "Create New Account"
   └─ Routes to /register page

2. User fills registration form
   ├─ Username
   ├─ Email
   ├─ Password
   └─ Confirm Password

3. Submit form → POST /api/auth/register
   ├─ Validate input (all fields required)
   ├─ Validate password match (password === confirmPassword)
   ├─ Validate password length (min 6 chars)
   ├─ Check if email/username already exists
   ├─ Hash password with bcryptjs (10 rounds)
   ├─ Insert into users table
   └─ Return success

4. Frontend receives success → redirect to /login


USER LOGIN
─────────────────────────────────────────────────────────────
1. User visits /login
   └─ Fills email and password

2. Submit form → POST /api/auth/login
   ├─ Validate input (both fields required)
   ├─ Query users table by email
   ├─ If not found → error "Invalid email or password"
   ├─ Compare password with hash using bcryptjs
   ├─ If mismatch → error "Invalid email or password"
   ├─ If match:
   │  ├─ Generate JWT token (user_id, email)
   │  ├─ Set HTTP-only cookie with token
   │  ├─ Return user data + message
   └─ Return success

3. Frontend receives success → save user to localStorage
   └─ Redirect to /dashboard


DASHBOARD PROTECTION
─────────────────────────────────────────────────────────────
1. Dashboard useEffect checks localStorage for user
   ├─ If no user → redirect to /login
   └─ If user exists → display dashboard

2. User interactions:
   ├─ Time In → timestamp in state
   ├─ Time Out → timestamp in state
   ├─ Submit → calculate hours, save to localStorage
   │  (Ready for future database integration)
   ├─ Edit/Delete → modify entries
   └─ Logout → POST /api/auth/logout → clear storage


TIME ENTRY FLOW (Currently localStorage)
─────────────────────────────────────────────────────────────
1. User clicks "🟢 Time In"
   └─ setCurrentTimeIn(new Date())

2. User clicks "🔴 Time Out"
   └─ setCurrentTimeOut(new Date())

3. User clicks "📋 Submit"
   ├─ Calculate total hours
   ├─ Calculate overtime (if hours > 9)
   ├─ If overtime, prompt for reason
   ├─ Create TimeEntry object
   ├─ Save to localStorage: entries_${userId}
   └─ Display in list

4. User can Edit/Delete
   ├─ Edit: set isEditing = true
   ├─ Save: update entry, refresh localStorage
   └─ Delete: remove from array, refresh localStorage

Note: Ready for future database integration via 
      POST /api/time-entries
```

## 🔐 Security Implementation

```
PASSWORD SECURITY
─────────────────────────────────────────────────────────────
1. User enters password
   └─ Password sent HTTPS (in production)

2. Backend receives password
   ├─ Generate salt (bcryptjs: 10 rounds)
   ├─ Hash password with salt
   ├─ Store hashed password in database
   └─ Original password never stored

3. Verification on login
   ├─ Get hash from database
   ├─ Compare user password with hash
   ├─ bcryptjs.compare() returns boolean
   └─ Verify or reject


JWT TOKEN SECURITY
─────────────────────────────────────────────────────────────
1. On successful login
   ├─ Create JWT with user_id and email
   ├─ Sign with JWT_SECRET
   ├─ Set 30-day expiration
   └─ Set HTTP-only cookie (secure in production)

2. Token storage
   └─ HTTP-only cookie (prevents XSS access)
   └─ Secure flag in production (HTTPS only)
   └─ SameSite: Lax (CSRF protection)

3. Client-side protection
   ├─ User data in localStorage (non-sensitive)
   ├─ Dashboard checks localStorage on load
   ├─ Redirects to login if no user
   └─ Manual logout clears all storage


DATABASE SECURITY
─────────────────────────────────────────────────────────────
1. User credentials
   ├─ Email: UNIQUE constraint
   ├─ Username: UNIQUE constraint
   ├─ Password: Always hashed before storage
   └─ Never compare plain text passwords

2. Relationships
   ├─ time_entries.user_id → users.id (Foreign Key)
   ├─ Cascade delete: if user deleted, entries deleted
   └─ Each user sees only their own entries

3. Input validation
   ├─ All fields validated before processing
   ├─ Password requirements enforced
   ├─ Email format validated
   └─ SQL injection prevented by parameterized queries
```

## 🔄 Component Interactions

```
PAGE HIERARCHY
─────────────────────────────────────────────────────────────
layout.tsx (Root)
├── page.tsx (Home)
├── register/page.tsx
│   └── <RegisterForm /> component
├── login/page.tsx
│   └── <LoginForm /> component
└── dashboard/page.tsx
    ├── Auth check (redirect to /login if needed)
    ├── Displays user info
    ├── <Entry /> component (maps entries array)
    │   ├── Displays entry data
    │   ├── Edit mode (inline inputs)
    │   └── Actions: Edit, Delete, Save
    └── Totals: overtime calculation


COMPONENT DATA FLOW
─────────────────────────────────────────────────────────────
RegisterForm
├── State: { username, email, password, confirmPassword }
├── onChange: update state
├── onSubmit: POST /api/auth/register
└── Result: redirect to /login or show error

LoginForm
├── State: { email, password }
├── onChange: update state
├── onSubmit: POST /api/auth/login
├── Result: localStorage.setItem('user', response.user)
└── Redirect: /dashboard

Dashboard
├── State: { user, entries, currentTimeIn, currentTimeOut }
├── useEffect: load from localStorage on mount
├── Functions:
│   ├── handleTimeIn: setCurrentTimeIn(now)
│   ├── handleTimeOut: setCurrentTimeOut(now)
│   ├── handleSubmit: create entry, save to localStorage
│   ├── handleEdit: set isEditing = true
│   ├── handleDelete: remove from array
│   ├── handleSaveEntry: update entry
│   └── handleLogout: POST /api/auth/logout, redirect
└── Maps <Entry /> for each entry

Entry
├── Props: { entry, index, onEdit, onDelete, onSave }
├── Display mode:
│   ├── Show entry data (date, time, hours, OT)
│   ├── Edit button
│   └── Delete button
└── Edit mode:
    ├── Inline inputs (date, time, reason)
    ├── Save button
    └── Calculate on save
```

## 📈 API Request/Response Examples

```
REGISTER REQUEST
─────────────────────────────────────────────────────────────
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

REGISTER RESPONSE (Success)
─────────────────────────────────────────────────────────────
Status: 201 Created

{
  "message": "Registration successful"
}

REGISTER RESPONSE (Error)
─────────────────────────────────────────────────────────────
Status: 400 Bad Request

{
  "error": "User with this email already exists"
}


LOGIN REQUEST
─────────────────────────────────────────────────────────────
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

LOGIN RESPONSE (Success)
─────────────────────────────────────────────────────────────
Status: 200 OK
Set-Cookie: authToken=eyJhbGc...; HttpOnly; Secure; ...

{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}

LOGIN RESPONSE (Error)
─────────────────────────────────────────────────────────────
Status: 401 Unauthorized

{
  "error": "Invalid email or password"
}


LOGOUT REQUEST
─────────────────────────────────────────────────────────────
POST /api/auth/logout

LOGOUT RESPONSE
─────────────────────────────────────────────────────────────
Status: 200 OK
Set-Cookie: authToken=; Max-Age=0; ...

{
  "message": "Logout successful"
}
```

## 🎯 File Dependencies

```
app/page.tsx
├── next/navigation (useRouter)
├── next/link
└── localStorage (user check)

app/register/page.tsx
├── components/RegisterForm
└── next/navigation (useRouter via component)

components/RegisterForm.tsx
├── react (useState, FormEvent)
├── next/navigation (useRouter)
├── next/link
└── /api/auth/register (fetch)

app/api/auth/register/route.ts
├── next/server (NextRequest, NextResponse)
├── mysql2/promise (database)
├── lib/auth (hashPassword)
└── types (implied validation)

lib/auth.ts
├── bcryptjs (hash, compare)
├── jsonwebtoken (sign, verify)
└── environment variables

lib/db.ts
├── mysql2/promise (connection)
└── database initialization logic

Dashboard page
├── react (useState, useEffect, useCallback)
├── next/navigation (useRouter)
├── components/Entry
├── types/index (TimeEntry interface)
├── lib/utils (time calculations)
└── localStorage (entries management)
```

This architecture supports:
✅ User registration with validation
✅ Secure password hashing
✅ JWT-based authentication
✅ Protected routes (client-side)
✅ Time entry management
✅ Data persistence (localStorage → ready for DB)
✅ Responsive UI with Tailwind CSS
✅ Type safety with TypeScript
