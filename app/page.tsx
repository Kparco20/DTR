'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="w-full max-w-2xl">
      <div className="card p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Daily Time-In Report</h1>
        <p className="text-muted text-lg mb-8">
          Track your work hours and manage overtime efficiently
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block button-submit py-3 text-center text-lg hover:bg-blue-600"
          >
            🔐 Login to Your Account
          </Link>
          <Link
            href="/register"
            className="block button bg-green-600 hover:bg-green-700 py-3 text-center text-lg"
          >
            ✨ Create New Account
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Features:</h3>
          <ul className="text-xs text-muted space-y-1 text-left">
            <li>✓ Easy time-in and time-out tracking</li>
            <li>✓ Automatic overtime calculation</li>
            <li>✓ Secure user authentication</li>
            <li>✓ Database storage with XAMPP</li>
            <li>✓ Edit and delete entries</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
