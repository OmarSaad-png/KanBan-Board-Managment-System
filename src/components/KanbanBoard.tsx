import { useState } from 'react';
import { Task, Status, statuses } from '../utils/data-tasks';
import TaskCard from './TaskCard';
import { User } from '../utils/auth-types';

interface KanbanBoardProps {
  tasks: Task[];
  user: User;
  users: User[];
  onTaskUpdate: (task: Task) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

export default function KanbanBoard({ 
  tasks, 
  user, 
  users, 
  onTaskUpdate,
  onDeleteTask 
}: KanbanBoardProps) {
  const [draggingOver, setDraggingOver] = useState<Status | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const status = e.currentTarget.dataset.status as Status;
    setDraggingOver(status);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('id');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== status) {
      const updatedTask = { ...task, status };
      try {
        await onTaskUpdate(updatedTask);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
    setDraggingOver(null);
  };

  const getColumnTasks = (status: Status) => tasks.filter(task => task.status === status);

  const findUser = (userId?: string) => {
    if (!userId) return undefined;
    return users.find(u => u.id === userId);
  };

  return (
    <div className="flex flex-1 gap-4 p-4 overflow-x-auto">
      {statuses.map(status => (
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
                user={user}
                onDelete={onDeleteTask}
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