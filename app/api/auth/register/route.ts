import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword, faceDescriptor, faceImage } = await request.json();

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!faceDescriptor) {
      return NextResponse.json(
        { error: 'Face recognition required for registration' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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
          face_descriptor LONGTEXT NOT NULL,
          face_image LONGTEXT,
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
          face_verified BOOLEAN DEFAULT FALSE,
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
      // Check if user exists
      const [existingUser] = await connection.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if ((existingUser as any[]).length > 0) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert user with face data
      await connection.query(
        'INSERT INTO users (username, email, password, face_descriptor, face_image) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, faceDescriptor, faceImage || null]
      );

      return NextResponse.json(
        { message: 'Registration successful' },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
