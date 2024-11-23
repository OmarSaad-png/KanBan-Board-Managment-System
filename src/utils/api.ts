// Create a new file for API calls
const API_BASE_URL = 'http://localhost:3000';

import { Task } from './data-tasks';
import { User } from './auth-types';
import { KPIRecord } from './data-tasks';
import { CalendarEvent } from './calendar-types';

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('Unknown API error occurred');
  }
};

export async function fetchTasks(): Promise<Task[]> {
  return fetchWithTimeout(`${API_BASE_URL}/tasks`);
}

export async function updateTaskAPI(task: Task): Promise<Task> {
  return fetchWithTimeout(`${API_BASE_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
}

export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchKPIRecords(): Promise<KPIRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/kpi`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(`Failed to fetch KPI records: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function addKPIRecord(record: Omit<KPIRecord, 'id'>): Promise<KPIRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/kpi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`Failed to add KPI record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  return fetchWithTimeout(`${API_BASE_URL}/calendar-events`);
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  return fetchWithTimeout(`${API_BASE_URL}/calendar-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
}

export async function updateCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  return fetchWithTimeout(`${API_BASE_URL}/calendar-events/${event.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
} 