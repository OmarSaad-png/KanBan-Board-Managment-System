export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'deadline' | 'milestone';
  description?: string;
  attendees?: string[]; // User IDs
  taskId?: string;
  createdBy: string;
}

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number;
} 