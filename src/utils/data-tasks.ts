export type Status = 'todo' | 'in-progress' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export const statuses: Status[] = ['todo', 'in-progress', 'done']

export interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  points?: number
  assignee?: string
  clientId?: string
  createdBy: string
}

export interface Column {
  status: Status
  tasks: Task[]
}