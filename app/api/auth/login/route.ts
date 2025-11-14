import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { comparePasswords, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First, create connection without database to initialize
    let connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });

    // Create database if it doesn't exist
    try {
      await connection.query('CREATE DATABASE IF NOT EXISTS dtr_db');
      await connection.query('USE dtr_db');
      
      // Create tables if they don't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await connection.query(`
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
        )
      `);
    } catch (dbError) {
      console.error('Database initialization error:', dbError);
      // Continue even if initialization fails - connection is ready
    }

    // Now use the connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dtr_db',
    });

    try {
      // Find user
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const user = (users as any[])[0];

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Compare passwords
      const passwordMatch = await comparePasswords(password, user.password);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      const response = NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
        { status: 200 }
      );

      // Set token in cookie
      response.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } finally {
      await connection.end();
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
