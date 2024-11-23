import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';

interface ClientDashboardProps {
  user: User;
  tasks: Task[];
  users: User[];
  onLogout: () => void;
}

export default function ClientDashboard({ 
  user, 
  tasks: initialTasks,
  users,
  onLogout 
}: ClientDashboardProps) {
  const [tasks] = useState(initialTasks);
  
  const progress = Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Project Overview" 
        userName={user.name}
        onLogout={onLogout}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p>Project Progress: {progress}%</p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Header>

      <main className="flex-1 overflow-auto">
        <KanbanBoard 
          tasks={tasks} 
          user={user}
          users={users}
          onTaskUpdate={async () => {}} // Clients can't update tasks
        />
      </main>
    </div>
  );
} 