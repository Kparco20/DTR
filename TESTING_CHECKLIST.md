# DTR Application - Setup Verification Checklist

## ✅ Pre-Launch Checklist

### XAMPP Setup
- [ ] XAMPP installed on system
- [ ] MySQL service started in XAMPP Control Panel
- [ ] phpMyAdmin accessible at http://localhost/phpmyadmin
- [ ] MySQL port 3306 is available (not blocked)

### Node.js & Dependencies
- [ ] Node.js v18 or higher installed
- [ ] npm packages installed (`npm install` completed)
- [ ] All dependencies visible: mysql2, bcryptjs, jsonwebtoken

### Configuration Files
- [ ] `.env.local` exists with database credentials
- [ ] JWT_SECRET set (even if test value)
- [ ] DB_HOST=localhost
- [ ] DB_USER=root
- [ ] DB_PASSWORD empty (or set if changed in XAMPP)
- [ ] DB_NAME=dtr_db

### Project Structure
- [ ] `/app/api/auth/` folder exists with route.ts files
- [ ] `/app/register/`, `/app/login/`, `/app/dashboard/` pages exist
- [ ] `/components/` has RegisterForm, LoginForm, Entry components
- [ ] `/lib/` has auth.ts, db.ts, utils.ts
- [ ] `/types/` has index.ts

## 🚀 Launch Instructions

### Step 1: Start XAMPP MySQL
```bash
# Open XAMPP Control Panel and click Start next to MySQL
# OR on Windows, MySQL may auto-start
```

### Step 2: Create Database (Choose One Method)

**Method A: Automatic (App will attempt)**
- Just run the app and let it initialize

**Method B: Manual via phpMyAdmin**
1. Visit http://localhost/phpmyadmin
2. Click "New" → Create database `dtr_db`
3. Import SQL or let app create tables

**Method C: Manual SQL**
1. Visit http://localhost/phpmyadmin
2. Go to SQL tab
3. Paste the SQL from QUICKSTART.md

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Verify Application
- [ ] http://localhost:3000 loads with landing page
- [ ] "Create New Account" button visible
- [ ] "Login to Your Account" button visible

## 📝 User Testing Flow

### Test 1: Registration
1. Click "Create New Account"
2. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test@123`
   - Confirm: `Test@123`
3. Click Register
4. Should see success message
5. Should redirect to login page

### Test 2: Login
1. Enter credentials from Test 1
2. Click Login
3. Should redirect to dashboard
4. Should see welcome message with username

### Test 3: Time Tracking
1. On dashboard, click "🟢 Time In"
2. Should see alert with current time
3. Click "🔴 Time Out"
4. Should see alert with current time
5. Click "📋 Submit"
6. If overtime > 0, should prompt for reason
7. Should see entry in list below

### Test 4: Entry Management
1. Click "✏️ Edit" on any entry
2. Modify date/time/reason
3. Click "💾 Save"
4. Entry should update
5. Click "🗑️ Delete" on any entry
6. Click "OK" on confirmation
7. Entry should be removed

### Test 5: Logout
1. Click "🚪 Logout" button (top right)
2. Should redirect to login page
3. Should not be able to access /dashboard

## 🔍 Database Verification

### Check Users Table
1. Open phpMyAdmin
2. Select `dtr_db` database
3. Click `users` table
4. Should see registered user with hashed password

### Check Time Entries Table
1. Select `dtr_db` database
2. Click `time_entries` table
3. Should see entries after submitting from dashboard

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
- [ ] XAMPP MySQL is running
- [ ] Database credentials in `.env.local` are correct
- [ ] Port 3306 is available
- [ ] Try restarting MySQL service

### Issue: "Module not found" errors
- [ ] Run `npm install` again
- [ ] Delete `node_modules` and `.next`
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Reinstall dependencies

### Issue: Registration fails
- [ ] Check `.env.local` database settings
- [ ] Check MySQL is running
- [ ] Look at terminal for error messages
- [ ] Verify password is at least 6 characters

### Issue: Login doesn't work
- [ ] Verify user exists in database
- [ ] Check password is correct
- [ ] Look at browser console for errors
- [ ] Check terminal logs

### Issue: Can't access dashboard after login
- [ ] Clear browser cookies
- [ ] Clear localStorage
- [ ] Check browser console for errors
- [ ] Logout and login again

### Issue: Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

## 📊 Expected Behavior

| Action | Expected Result | Status |
|--------|-----------------|--------|
| Visit / | Landing page loads | ⏳ |
| Click Register | Goes to /register | ⏳ |
| Submit registration | User created in DB | ⏳ |
| Click Login | Goes to /login | ⏳ |
| Submit login | JWT token set, redirect to /dashboard | ⏳ |
| Time In | Alert shows time | ⏳ |
| Time Out | Alert shows time | ⏳ |
| Submit Entry | Entry saved, shown in list | ⏳ |
| Edit Entry | Changes persist | ⏳ |
| Delete Entry | Entry removed | ⏳ |
| Logout | Redirect to /login, no dashboard access | ⏳ |

## 📱 Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## 🎯 Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API responses < 500ms
- [ ] No console errors
- [ ] No console warnings (except expected)
- [ ] Responsive on mobile

## ✨ Final Sign-Off

- [ ] All tests passed
- [ ] No critical errors
- [ ] Data persists after refresh
- [ ] Logout clears user session
- [ ] App is ready for deployment

---

**Date Tested**: _______________________
**Tester Name**: _______________________
**Notes**: ________________________________________________________________________

For issues or questions, refer to README.md or QUICKSTART.md
