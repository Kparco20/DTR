'use client';

import { TimeEntry } from '@/types/index';
import {
  formatTime,
  calculateHours,
  calculateOvertime,
  formatDateForInput,
  convertTimeToInput,
} from '@/lib/utils';

interface EntryProps {
  entry: TimeEntry;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onSave: (index: number, updated: TimeEntry) => void;
}

export default function Entry({
  entry,
  index,
  onEdit,
  onDelete,
  onSave,
}: EntryProps) {
  if (entry.isEditing) {
    return (
      <div className="entry">
        <div className="entry-meta flex-1">
          <input
            type="date"
            id={`editDate${index}`}
            defaultValue={entry.rawDate || formatDateForInput(entry.date)}
            className="mb-2 block"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="time"
              id={`editIn${index}`}
              defaultValue={convertTimeToInput(entry.timeIn)}
            />
            <span>→</span>
            <input
              type="time"
              id={`editOut${index}`}
              defaultValue={convertTimeToInput(entry.timeOut)}
            />
          </div>
          <input
            type="text"
            id={`editReason${index}`}
            placeholder="Reason (optional)"
            defaultValue={entry.reason || ''}
            className="w-full"
          />
        </div>
        <button
          onClick={() => {
            const dateEl = document.getElementById(
              `editDate${index}`
            ) as HTMLInputElement;
            const inEl = document.getElementById(
              `editIn${index}`
            ) as HTMLInputElement;
            const outEl = document.getElementById(
              `editOut${index}`
            ) as HTMLInputElement;
            const reasonEl = document.getElementById(
              `editReason${index}`
            ) as HTMLInputElement;

            if (!dateEl.value || !inEl.value || !outEl.value) {
              alert('Date, Time In, and Time Out are required!');
              return;
            }

            const start = new Date(`2000-01-01T${inEl.value}`);
            const end = new Date(`2000-01-01T${outEl.value}`);
            const totalHours = calculateHours(start, end);
            const overtime = calculateOvertime(totalHours);

            const updated: TimeEntry = {
              ...entry,
              date: new Date(dateEl.value).toLocaleDateString(),
              rawDate: dateEl.value,
              day: new Date(dateEl.value).toLocaleDateString(undefined, {
                weekday: 'long',
              }),
              timeIn: formatTime(start),
              timeOut: formatTime(end),
              totalHours,
              overtime,
              reason: reasonEl.value,
            };

            delete updated.isEditing;
            onSave(index, updated);
          }}
          className="button-submit"
        >
          💾 Save
        </button>
      </div>
    );
  }

  return (
    <div className="entry">
      <div className="entry-meta">
        <div>{entry.day} ({entry.date})</div>
        <div>
          {entry.timeIn} → {entry.timeOut}
        </div>
        <div className="text-muted">
          Worked: {entry.totalHours.toFixed(2)} hrs
          {entry.overtime > 0 && ` | OT: ${entry.overtime.toFixed(2)} hrs`}
        </div>
        {entry.reason && <div className="text-reason">🕒 Reason: {entry.reason}</div>}
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onEdit(index)} className="button-edit">
          ✏️ Edit
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this record?')) {
              onDelete(index);
            }
          }}
          className="button-delete"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
