// Create a new file for API calls
const API_BASE_URL = 'http://localhost:3000';

import { Task } from './data-tasks';

export async function fetchTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

export async function updateTaskAPI(task: Task) {
  const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
} 