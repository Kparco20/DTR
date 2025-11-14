'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FaceScanner from './FaceScanner';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [faceData, setFaceData] = useState<{
    descriptor: string;
    image: string;
  } | null>(null);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!faceData) {
      setError('Please capture your face before registering');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          faceDescriptor: faceData.descriptor,
          faceImage: faceData.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      alert('Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Create Account</h1>
        <p className="text-muted text-center mb-6 text-sm">
          Register to start tracking your work hours
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {faceData && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            ✅ Face captured successfully
            <button
              onClick={() => setFaceData(null)}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Re-capture
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full bg-[#1e293b] border border-[#334155] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full bg-[#1e293b] border border-[#334155] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full bg-[#1e293b] border border-[#334155] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full bg-[#1e293b] border border-[#334155] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Face Recognition 👤</label>
            <button
              type="button"
              onClick={() => setShowFaceCapture(true)}
              className="w-full bg-[#1e293b] border border-[#334155] text-white rounded-lg px-4 py-2 hover:border-blue-500 transition"
            >
              {faceData ? '✅ Face Captured' : '📸 Capture Your Face'}
            </button>
            <p className="text-xs text-muted mt-1">
              Required for face recognition time-in
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !faceData}
            className="w-full button-submit py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Login here
          </Link>
        </p>
      </div>

      {showFaceCapture && (
        <FaceScanner
          onCapture={(descriptor: string, image: string) => {
            setFaceData({ descriptor, image });
            setShowFaceCapture(false);
          }}
          onCancel={() => setShowFaceCapture(false)}
          title="Scan Your Face"
        />
      )}
    </div>
  );
}
