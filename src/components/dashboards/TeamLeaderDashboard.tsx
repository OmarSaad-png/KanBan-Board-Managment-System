import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import NewTaskModal from '../modals/NewTaskModal';
import KPIDashboard from '../KPIDashboard';

interface TeamLeaderDashboardProps {
  user: User;
  tasks: Task[];
  users: User[];
  onLogout: () => void;
  onTaskUpdate: (task: Task) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id'>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
}

export default function TeamLeaderDashboard({
  user,
  tasks,
  users,
  onLogout,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}: TeamLeaderDashboardProps) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const teamMembers = users.filter(u => u.role === 'team_member');
  const clients = users.filter(u => u.role === 'client');

  const handleTaskApprove = async (task: Task) => {
    await onTaskUpdate({
      ...task,
      status: 'done',
      approvalStatus: 'approved'
    });
  };

  const handleTaskReject = async (task: Task) => {
    await onTaskUpdate({
      ...task,
      status: 'in-progress',
      approvalStatus: 'rejected'
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Team Leader Dashboard" 
        userName={user.name}
        onLogout={onLogout}
      >
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
            transition-colors duration-200"
        >
          New Task
        </button>
      </Header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <KanbanBoard
            tasks={tasks}
            user={user}
            users={users}
            onTaskUpdate={onTaskUpdate}
            onTaskApprove={handleTaskApprove}
            onTaskReject={handleTaskReject}
          />
        </div>
        <div className="w-80 border-l overflow-auto">
          <KPIDashboard teamMembers={teamMembers} />
        </div>
      </div>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={onTaskCreate}
          teamMembers={teamMembers}
          clients={clients}
          currentUser={user}
        />
      )}
    </div>
  );
} 