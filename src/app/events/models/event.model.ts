export type ReminderFrequency = 'once' | 'daily' | 'weekly';

export interface Reminder {
  enabled: boolean;
  dateTime?: string; // ISO
  frequency?: ReminderFrequency;
}

export interface EventItem {
  id: string;
  name: string;
  date: string; // ISO date only
  time: string; // e.g. "14:30"
  location?: string;
  participants?: string[]; // family member ids
  reminder?: Reminder;
}
