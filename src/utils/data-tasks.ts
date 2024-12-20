export type Status = 'todo' | 'in-progress' | 'done' | 'pending'
export type Priority = 'low' | 'medium' | 'high'
export const statuses: Status[] = ['todo', 'in-progress', 'done', 'pending']
export const leaderStatuses: Status[] = ['todo', 'in-progress', 'done', 'pending']
export const memberStatuses: Status[] = ['todo', 'in-progress', 'done']
export const clientStatuses: Status[] = ['todo', 'in-progress', 'pending', 'done']

export interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  points: number
  assignee?: string
  clientId?: string
  createdBy: string
  completedAt?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  dependsOn?: string
  dueDate: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

export interface Column {
  status: Status
  tasks: Task[]
}

export interface KPIRecord {
  userId: string
  taskId: string
  points: number
  completedAt: string
  approvedAt: string
}