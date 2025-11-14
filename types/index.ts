export interface TimeEntry {
  date: string;
  rawDate: string;
  day: string;
  timeIn: string;
  timeOut: string;
  totalHours: number;
  overtime: number;
  reason?: string;
  isEditing?: boolean;
}
