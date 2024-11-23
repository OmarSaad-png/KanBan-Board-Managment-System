import { useState, useEffect, useCallback } from 'react';
import { Task, Status, leaderStatuses, memberStatuses } from '../utils/data-tasks';
import { User } from '../utils/auth-types';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  user: User;
  users: User[];
  onTaskUpdate: (task: Task) => Promise<void>;
  onTaskApprove?: (task: Task) => Promise<void>;
  onTaskReject?: (task: Task) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

export default function KanbanBoard({ 
  tasks: initialTasks, 
  user, 
  users, 
  onTaskUpdate,
  onTaskApprove,
  onTaskReject,
  onTaskDelete
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggingOver, setDraggingOver] = useState<Status | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local tasks when prop changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Use different status arrays based on user role
  const visibleStatuses = user.role === 'team_leader' ? leaderStatuses : memberStatuses;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const status = e.currentTarget.dataset.status as Status;
    setDraggingOver(status);
  };

  const canMoveTask = (task: Task): boolean => {
    if (user.role === 'team_member') {
      // Don't allow moving approved tasks
      if (task.approvalStatus === 'approved') return false;
      
      // If task has dependency, check if it's completed and approved
      if (task.dependsOn) {
        const dependentTask = tasks.find(t => t.id === task.dependsOn);
        if (!dependentTask) return true; // If dependent task not found, allow move
        return dependentTask.status === 'done' && dependentTask.approvalStatus === 'approved';
      }
      return true;
    }
    return true;
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (isUpdating) return;

    const taskId = e.dataTransfer.getData('id');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task || task.status === status || !canMoveTask(task)) return;
    
    setIsUpdating(true);
    try {
      const updatedTask = { 
        ...task, 
        status: user.role === 'team_member' && status === 'done' ? 'pending' : status,
        completedAt: status === 'done' ? new Date().toISOString() : task.completedAt
      };

      // Update local state immediately
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );

      // Call API to update backend
      await onTaskUpdate(updatedTask);
    } catch (error) {
      // Revert local state if API call fails
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? task : t)
      );
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
      setDraggingOver(null);
    }
  };

  const getColumnTasks = useCallback((status: Status) => {
    if (user.role === 'team_member') {
      // For team members, show pending tasks in the 'done' column
      if (status === 'done') {
        return tasks.filter(task => 
          task.assignee === user.id && 
          (task.status === 'done' || task.status === 'pending')
        );
      }
      
      return tasks.filter(task => 
        task.assignee === user.id && 
        task.status === status
      );
    }
    
    if (user.role === 'team_leader') {
      return tasks.filter(task => task.status === status);
    }
    
    return tasks.filter(task => 
      task.clientId === user.id && 
      task.status === status
    );
  }, [tasks, user.role, user.id]);

  const findUser = useCallback((userId?: string) => {
    if (!userId) return undefined;
    return users.find(u => u.id === userId);
  }, [users]);

  return (
    <div className="flex flex-1 gap-4 p-4 overflow-x-auto">
      {visibleStatuses.map(status => (
        <div
          key={status}
          className={`flex-1 min-w-[300px] bg-gray-100 rounded-lg p-4
            ${draggingOver === status ? 'bg-gray-200' : ''}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
          data-status={status}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold capitalize">
              {status.replace('-', ' ')}
            </h2>
            <span className="px-2 py-1 text-sm bg-gray-200 rounded-full">
              {getColumnTasks(status).length}
            </span>
          </div>

          <div className="space-y-3">
            {getColumnTasks(status).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                tasks={tasks}
                user={user}
                onTaskUpdate={onTaskUpdate}
                onApprove={onTaskApprove}
                onReject={onTaskReject}
                onDelete={onTaskDelete}
                assignee={findUser(task.assignee)}
                client={findUser(task.clientId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 