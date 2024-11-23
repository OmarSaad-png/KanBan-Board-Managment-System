import { useState, useEffect } from 'react'
import { Task, Priority } from '../utils/data-tasks'
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
  tasks: Task[];
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const satisfies Record<Priority, string>;

const getDaysRemaining = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const TaskCard = ({ task, onDelete, onApprove, onReject, user, assignee, client, tasks }: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (task.approvalStatus === 'rejected') {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [task.approvalStatus]);

  const dependentTask = task.dependsOn ? tasks.find(t => t.id === task.dependsOn) : null;
  const canDrag = user.role === 'team_member' && 
    task.assignee === user.id && 
    task.approvalStatus !== 'approved' && 
    (!task.dependsOn || (dependentTask?.status === 'done' && dependentTask?.approvalStatus === 'approved'));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
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

  const handleDelete = async () => {
    if (!onDelete) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <>
      <div
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
          p-4 mb-3 rounded-lg shadow-sm border border-gray-200
          bg-white ${canDrag ? 'cursor-move' : 'cursor-not-allowed'} 
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${isFlashing ? 'animate-flash' : ''}
          hover:shadow-md
        `}
        role="article"
        aria-label={`Task: ${task.title}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-mono">{task.id}</span>
          {user.role === 'team_member' && task.status === 'pending' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              Pending Approval
            </span>
          )}
          <span 
            className={`
              px-2 py-1 rounded-full text-xs font-semibold
              ${priorityColors[task.priority]}
            `}
          >
            {task.priority}
          </span>
          {user.role === 'team_leader' && onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
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

        {/* Update the dependency info section */}
        {task.dependsOn && (
          <div className="mt-2 text-sm text-gray-500">
            Depends on: {task.dependsOn}
            {dependentTask && (
              <span className="ml-2">
                {dependentTask.status === 'done' && dependentTask.approvalStatus === 'approved' 
                  ? '(Completed)'
                  : '(Waiting for dependent task completion)'}
              </span>
            )}
          </div>
        )}

        {task.dueDate && !(task.status === 'done' && task.approvalStatus === 'approved') && (
          <div className={`mt-2 text-sm ${
            getDaysRemaining(task.dueDate) <= 1 ? 'text-red-600' : 'text-gray-600'
          }`}>
            Due in: {getDaysRemaining(task.dueDate)} days
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                  hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 
                  hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TaskCard