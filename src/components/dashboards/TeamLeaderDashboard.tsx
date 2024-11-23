import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import NewTaskModal from '../modals/NewTaskModal';
import KPIDashboard from '../KPIDashboard';
import { approveTaskWithKPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import CalendarModal from '../modals/CalendarModal';
import ChatWindow from '../chat/ChatWindow';
import ChatList from '../chat/ChatList';

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
  const [kpiRefreshCounter, setKpiRefreshCounter] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [currentChat, setCurrentChat] = useState<User | null>(null);
  const [ws] = useState(() => new WebSocket('ws://localhost:3001'));

  const teamMembers = users.filter(u => u.role === 'team_member');
  const clients = users.filter(u => u.role === 'client');

  const handleTaskApprove = async (task: Task) => {
    try {
      const { task: updatedTask } = await approveTaskWithKPI(task);
      await onTaskUpdate(updatedTask);
      setKpiRefreshCounter(prev => prev + 1);
      toast.success(`Task "${task.title}" approved successfully`);
    } catch (error) {
      console.error('Failed to approve task:', error);
      toast.error('Failed to approve task');
    }
  };

  const handleTaskReject = async (task: Task) => {
    await onTaskUpdate({
      ...task,
      status: 'in-progress',
      approvalStatus: 'rejected'
    });
  };

  const handleChatSelect = (selectedUser: User) => {
    setCurrentChat(selectedUser);
    setShowChatList(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Team Leader Dashboard" 
        userName={user.name}
        userRole={user.role}
        onLogout={onLogout}
        onCalendarClick={() => setShowCalendar(true)}
        onChatClick={() => setShowChatList(true)}
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
            onTaskDelete={onTaskDelete}
          />
        </div>
        <div className="w-80 border-l overflow-auto">
          <KPIDashboard 
            teamMembers={teamMembers} 
            refreshTrigger={kpiRefreshCounter}
          />
        </div>
      </div>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={onTaskCreate}
          teamMembers={teamMembers}
          clients={clients}
          currentUser={user}
          availableTasks={tasks}
        />
      )}

      {showCalendar && (
        <CalendarModal
          onClose={() => setShowCalendar(false)}
          tasks={tasks}
          user={user}
          users={users}
        />
      )}

      {showChatList && (
        <ChatList
          currentUser={user}
          users={users}
          onSelectUser={handleChatSelect}
          onClose={() => setShowChatList(false)}
        />
      )}

      {currentChat && (
        <ChatWindow
          currentUser={user}
          otherUser={currentChat}
          onClose={() => setCurrentChat(null)}
          ws={ws}
        />
      )}
    </div>
  );
} 