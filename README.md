# Daily Time-In Report - Next.js with Authentication

A modern React-based time-in/time-out reporting application built with Next.js, TypeScript, Tailwind CSS, and XAMPP MySQL database.

## Features

- ✅ **User Authentication**: Secure registration and login system
- ✅ **Time In/Out Tracking**: Record work hours with simple button clicks
- ✅ **Overtime Calculation**: Automatically calculates overtime (anything over 9 hours)
- ✅ **Database Storage**: All data saved to XAMPP MySQL
- ✅ **User-specific Data**: Each user sees only their own time entries
- ✅ **Edit & Delete**: Modify or remove entries as needed
- ✅ **Reason Tracking**: Add reasons for overtime hours
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Dark Theme**: Modern dark UI with Tailwind CSS

## Project Structure

```
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts    # Registration API
│   │   ├── login/route.ts       # Login API
│   │   └── logout/route.ts      # Logout API
│   ├── dashboard/page.tsx       # Main dashboard (protected)
│   ├── register/page.tsx        # Registration page
│   ├── login/page.tsx           # Login page
│   ├── globals.css              # Tailwind CSS global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page
├── components/
│   ├── Entry.tsx                # Time entry component
│   ├── RegisterForm.tsx         # Registration form
│   └── LoginForm.tsx            # Login form
├── lib/
│   ├── utils.ts                 # Utility functions
│   ├── auth.ts                  # Authentication helpers
│   └── db.ts                    # Database connection
├── types/
│   └── index.ts                 # TypeScript type definitions
└── ...config files
```

## Prerequisites

- **Node.js** (v18 or higher)
- **XAMPP** (for MySQL database)
- **npm** or **yarn**

## Installation & Setup

### 1. Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Open http://localhost/phpmyadmin to verify MySQL is running

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database

The app will automatically create the database and tables when you first run it. However, you can manually create them:

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named `dtr_db`
3. The app will create the required tables automatically on first run

**Or run this SQL in phpMyAdmin:**

```sql
CREATE DATABASE IF NOT EXISTS dtr_db;

USE dtr_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  time_in TIME NOT NULL,
  time_out TIME,
  total_hours DECIMAL(5,2),
  overtime DECIMAL(5,2),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Environment Variables

Create or update `.env.local` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dtr_db
```

**Note:** XAMPP default MySQL password is empty. If you've set a password, update `DB_PASSWORD`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First Time User

1. **Register**: Click "Create New Account" and fill in:
   - Username (unique)
   - Email (unique)
   - Password (at least 6 characters)
   - Confirm Password

2. **Login**: Use your registered email and password to login

### Recording Time

1. **Time In**: Click the "🟢 Time In" button when you start work
2. **Time Out**: Click the "🔴 Time Out" button when you finish
3. **Submit**: Click the "📋 Submit" button to save the entry
4. **View Overtime**: Total overtime hours displayed at the bottom

### Managing Entries

- **Edit**: Click ✏️ to modify an entry
- **Delete**: Click 🗑️ to remove an entry
- **Logout**: Click 🚪 to logout (located in dashboard header)

## Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **XAMPP MySQL** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **mysql2/promise** - MySQL driver

## Build for Production

```bash
npm run build
npm start
```

## Database Schema

### users table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Registration timestamp

### time_entries table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `date` - Date of entry
- `time_in` - Time clocked in
- `time_out` - Time clocked out
- `total_hours` - Total hours worked
- `overtime` - Hours over 9
- `reason` - Reason for overtime
- `created_at` - Entry creation timestamp

## Troubleshooting

### "Cannot connect to MySQL"
- Ensure XAMPP MySQL is running
- Check that `localhost` is accessible
- Verify credentials in `.env.local`

### "Database not found"
- The app should create `dtr_db` automatically
- If not, manually create it in phpMyAdmin

### "Cannot find module 'mysql2'"
- Run `npm install` again
- Delete `node_modules` and reinstall if issues persist

### Authentication issues
- Clear browser cookies and localStorage
- Check `.env.local` JWT_SECRET is set
- Ensure password hashing is working

## Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` in `.env.local` to a strong random string
- Use HTTPS in production
- Set secure MySQL password
- Never commit `.env.local` to version control
- Implement rate limiting on auth endpoints
- Add CORS configuration for API routes

## License

MIT
# DTR
