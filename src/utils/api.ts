// Create a new file for API calls
const API_BASE_URL = 'http://localhost:3000';

import { Task } from './data-tasks';
import { User } from './auth-types';
import { KPIRecord } from './data-tasks';
import { Message } from './message-types';
import { Attachment } from './data-tasks';

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
// Add this function to get the next task number
async function getNextTaskNumber(): Promise<number> {
  try {
    const tasks = await fetchTasks();
    const taskNumbers = tasks
      .map(task => {
        const match = task.id.match(/BUS-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    return taskNumbers.length > 0 ? Math.max(...taskNumbers) + 1 : 1;
  } catch (error) {
    console.error('Error getting next task number:', error);
    return 1; // Fallback to starting from 1 if there's an error
  }
}

// Update the task ID generation function
async function generateTaskId(): Promise<string> {
  const nextNumber = await getNextTaskNumber();
  return `BUS-${nextNumber}`;
}

// Update createTask to handle async ID generation
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    const taskWithId = {
      ...taskData,
      id: await generateTaskId()
    };

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskWithId),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Simplify error handling with a reusable wrapper
const handleApiError = (error: unknown, message: string): never => {
  throw new Error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
};

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/users`);
    return response;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch users');
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





export interface TaskApprovalData {
  taskId: string;
  userId: string;
  points: number;
  completedAt: string;
}

// Add new function to handle the entire approval process
export async function approveTaskWithKPI(task: Task): Promise<{ task: Task; kpi: KPIRecord }> {
  try {
    if (!task.assignee) {
      throw new Error('Cannot approve task without assignee');
    }

    const updatedTask = await updateTaskAPI({
      ...task,
      status: 'done',
      approvalStatus: 'approved'
    });

    const kpiRecord = await addKPIRecord({
      userId: task.assignee,
      taskId: task.id,
      points: task.points,
      completedAt: task.completedAt || new Date().toISOString(),
      approvedAt: new Date().toISOString()
    });

    return { task: updatedTask, kpi: kpiRecord };
  } catch (error) {
    throw error;
  }
}

export async function fetchChatHistory(userId1: string, userId2: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const messages: Message[] = await response.json();
    
    // Filter messages between these two users
    return messages.filter(msg => 
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
    );
  } catch (error) {
    throw new Error(`Failed to fetch chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function saveMessage(message: Message): Promise<Message> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`Failed to save message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Add attachment handling functions
export async function uploadAttachment(taskId: string, file: File, userId: string): Promise<Attachment> {
  try {
    // In a real app, you'd upload to cloud storage here
    // For this example, we'll just store metadata
    const attachment: Attachment = {
      id: Date.now().toString(),
      taskId,
      fileName: file.name,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file) // In real app, this would be cloud storage URL
    };

    const response = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachment),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Failed to upload attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchTaskAttachments(taskId: string): Promise<Attachment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/attachments?taskId=${taskId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(`Failed to fetch attachments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Add delete attachment function
export async function deleteAttachment(attachmentId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Cleanup the URL if it was created with createObjectURL
    const attachment = await fetchAttachment(attachmentId);
    if (attachment?.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  } catch (error) {
    throw new Error(`Failed to delete attachment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to fetch a single attachment
async function fetchAttachment(attachmentId: string): Promise<Attachment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch attachment:', error);
    return null;
  }
} 