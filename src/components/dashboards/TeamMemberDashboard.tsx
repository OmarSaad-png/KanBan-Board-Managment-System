import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import CalendarModal from '../modals/CalendarModal';

interface TeamMemberDashboardProps {
  user: User;
  tasks: Task[];
  users: User[];
  onLogout: () => void;
  onTaskUpdate: (task: Task) => Promise<void>;
}

export default function TeamMemberDashboard({ 
  user, 
  tasks: initialTasks, 
  users,
  onLogout,
  onTaskUpdate 
}: TeamMemberDashboardProps) {
  const [tasks] = useState(initialTasks);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Team Member Dashboard" 
        userName={user.name}
        onLogout={onLogout}
        onCalendarClick={() => setShowCalendar(true)}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p>My Tasks: {tasks.length}</p>
            <p>In Progress: {tasks.filter(t => t.status === 'in-progress').length}</p>
          </div>
        </div>
      </Header>

      <main className="flex-1 overflow-auto">
        <KanbanBoard 
          tasks={tasks} 
          user={user}
          users={users}
          onTaskUpdate={onTaskUpdate}
        />
      </main>

      {showCalendar && (
        <CalendarModal
          onClose={() => setShowCalendar(false)}
          tasks={tasks}
          user={user}
          users={users}
        />
      )}
    </div>
  );
} 