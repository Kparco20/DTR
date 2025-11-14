import { TimeEntry } from '@/types/index';

const LS_KEY = 'daily_timein_entries_v7';

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function calculateHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function calculateOvertime(hours: number): number {
  return hours > 9 ? hours - 9 : 0;
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  const [month, day, year] = date.toLocaleDateString().split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function convertTimeToInput(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  return `${h.padStart(2, '0')}:${m}`;
}

export function getStoredEntries(): TimeEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveEntries(entries: TimeEntry[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  }
}

export function calculateTotalOvertime(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => sum + e.overtime, 0);
}
