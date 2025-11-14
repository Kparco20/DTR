'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Entry from '@/components/Entry';
import { TimeEntry } from '@/types/index';
import {
  formatTime,
  calculateHours,
  calculateOvertime,
  calculateTotalOvertime,
} from '@/lib/utils';

interface User {
  id: number;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentTimeIn, setCurrentTimeIn] = useState<Date | null>(null);
  const [currentTimeOut, setCurrentTimeOut] = useState<Date | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Load entries from localStorage (for now, until we fetch from DB)
    const storedEntries = localStorage.getItem(`entries_${userData.id}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }

    setHydrated(true);
  }, [router]);

  const handleTimeIn = () => {
    if (currentTimeIn) {
      alert('You already timed in!');
      return;
    }
    const now = new Date();
    setCurrentTimeIn(now);
    alert(`✅ Time In recorded: ${formatTime(now)}`);
  };

  const handleTimeOut = () => {
    if (!currentTimeIn) {
      alert('Please Time In first!');
      return;
    }
    const now = new Date();
    setCurrentTimeOut(now);
    alert(`🕒 Time Out recorded: ${formatTime(now)}`);
  };

  const handleSubmit = () => {
    if (!currentTimeIn || !currentTimeOut) {
      alert('Please Time In and Time Out first.');
      return;
    }

    const totalHours = calculateHours(currentTimeIn, currentTimeOut);
    const overtime = calculateOvertime(totalHours);
    let reason = '';

    if (overtime > 0) {
      reason = prompt('Enter reason for overtime:') || '';
    }

    const now = new Date();
    const newEntry: TimeEntry = {
      date: now.toLocaleDateString(),
      rawDate: now.toISOString().split('T')[0],
      day: now.toLocaleDateString(undefined, { weekday: 'long' }),
      timeIn: formatTime(currentTimeIn),
      timeOut: formatTime(currentTimeOut),
      totalHours,
      overtime,
      reason,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    
    // Save to localStorage with user ID
    if (user) {
      localStorage.setItem(`entries_${user.id}`, JSON.stringify(updatedEntries));
    }

    setCurrentTimeIn(null);
    setCurrentTimeOut(null);
    alert('✅ Entry submitted successfully!');
  };

  const handleEdit = (index: number) => {
    const updatedEntries = [...entries];
    updatedEntries[index].isEditing = true;
    setEntries(updatedEntries);
  };

  const handleDelete = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    if (user) {
      localStorage.setItem(`entries_${user.id}`, JSON.stringify(updatedEntries));
    }
  };

  const handleSaveEntry = (index: number, updated: TimeEntry) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = updated;
    setEntries(updatedEntries);
    if (user) {
      localStorage.setItem(`entries_${user.id}`, JSON.stringify(updatedEntries));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!hydrated || !user) {
    return <div className="w-full max-w-2xl">Loading...</div>;
  }

  const totalOT = calculateTotalOvertime(entries);

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold m-0">Daily Time-In Report</h1>
          <p className="text-muted m-0 text-sm">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="button-delete px-4 py-2"
        >
          🚪 Logout
        </button>
      </header>

      <section className="card">
        <div className="flex gap-2 justify-center mb-3">
          <button onClick={handleTimeIn} className="button-timein">
            🟢 Time In
          </button>
          <button onClick={handleTimeOut} className="button-timeout">
            🔴 Time Out
          </button>
          <button onClick={handleSubmit} className="button-submit">
            📋 Submit
          </button>
        </div>

        <div className="mt-4">
          {entries.length === 0 ? (
            <div className="text-muted">
              No entries yet — click Submit to record.
            </div>
          ) : (
            entries.map((entry, i) => (
              <Entry
                key={i}
                entry={entry}
                index={i}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSaveEntry}
              />
            ))
          )}
        </div>

        <div className="mt-2.5 text-base font-bold text-accent bg-blue-500/10 p-2.5 rounded-lg text-center">
          Total Overtime: {totalOT.toFixed(2)} hrs
        </div>
      </section>
    </div>
  );
}
