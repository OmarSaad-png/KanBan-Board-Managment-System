import { useState } from 'react'
import { Task } from '../utils/data-tasks'
import { User } from '../utils/auth-types'

interface TaskCardProps {
  task: Task
  onDelete?: (taskId: string) => Promise<void>
  user: User
  assignee?: User
  client?: User
  onTaskUpdate: (task: Task) => Promise<void>;
  onApprove?: (task: Task) => Promise<void>;
  onReject?: (task: Task) => Promise<void>;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const

const TaskCard = ({ task, onTaskUpdate, onApprove, onReject, user, assignee, client }: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Only team members can drag their own tasks
  const canDrag = user.role === 'team_member' && task.assignee === user.id;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isUpdating || !canDrag) return;
    e.dataTransfer.setData('id', task.id);
    setIsDragging(true);
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleApprove = async () => {
    if (onApprove) {
      try {
        await onApprove(task);
      } catch (error) {
        console.error('Failed to approve task:', error);
      }
    }
  };

  const handleReject = async () => {
    if (onReject) {
      try {
        await onReject(task);
      } catch (error) {
        console.error('Failed to reject task:', error);
      }
    }
  };

  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        p-4 mb-3 rounded-lg shadow-sm border border-gray-200
        bg-white ${canDrag ? 'cursor-move' : 'cursor-default'} 
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:shadow-md
      `}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-mono">{task.id}</span>
        <span 
          className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${priorityColors[task.priority]}
          `}
        >
          {task.priority}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      
      <div className="space-y-1 mb-3 text-sm">
        {assignee && (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Assigned to: {assignee.name}</span>
          </div>
        )}
        {client && (
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Client: {client.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {task.points && (
          <span className="inline-flex items-center justify-center w-6 h-6 
            rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
            {task.points}
          </span>
        )}
      </div>

      {/* Show approval buttons only for team leader and pending tasks */}
      {user.role === 'team_leader' && task.status === 'pending' && (
        <div className="flex gap-2 mt-3 border-t pt-3">
          <button
            onClick={handleApprove}
            className="flex-1 px-3 py-1 bg-green-500 text-white rounded-md 
              hover:bg-green-600 text-sm font-medium transition-colors"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-3 py-1 bg-red-500 text-white rounded-md 
              hover:bg-red-600 text-sm font-medium transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskCard