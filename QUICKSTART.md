# Quick Start Guide for DTR Application

## Prerequisites
- XAMPP installed and running
- Node.js v18+
- npm or yarn

## Step 1: Start XAMPP MySQL

1. Open XAMPP Control Panel
2. Click **Start** next to MySQL
3. Verify it's running by visiting: http://localhost/phpmyadmin

## Step 2: Dependencies Already Installed ✓

All npm packages are installed. No additional action needed.

## Step 3: Run Development Server

```bash
npm run dev
```

The app will start at: http://localhost:3000

## Step 4: Create Database (First Time Only)

The app will attempt to create the database automatically. If you want to manually create it:

1. Go to http://localhost/phpmyadmin
2. Click "New" to create a new database
3. Name it: `dtr_db`
4. Click "Create"

Or paste this SQL in the SQL tab:

```sql
CREATE DATABASE IF NOT EXISTS dtr_db;

USE dtr_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE time_entries (
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

## Step 5: Test the Application

1. Open http://localhost:3000
2. Click "Create New Account"
3. Register with:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
4. Login with your credentials
5. Click "Time In" to start tracking

## Troubleshooting

### MySQL Connection Error
- Ensure XAMPP MySQL service is running
- Check database credentials in `.env.local`
- Default MySQL user: `root` (no password)

### Packages Not Found
```bash
rm -r node_modules package-lock.json
npm install
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

## Next Steps

- Check README.md for full documentation
- Explore the app features
- Customize database credentials in `.env.local` if needed
- For production, follow security guidelines in README.md

Happy tracking! 🚀
