import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import CalendarModal from '../modals/CalendarModal';
import ChatWindow from '../chat/ChatWindow';
import ChatList from '../chat/ChatList';

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
  const [showChatList, setShowChatList] = useState(false);
  const [currentChat, setCurrentChat] = useState<User | null>(null);
  const [ws] = useState(() => new WebSocket('ws://localhost:3001'));

  const handleChatSelect = (selectedUser: User) => {
    setCurrentChat(selectedUser);
    setShowChatList(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Team Member Dashboard" 
        userName={user.name}
        userRole={user.role}
        onLogout={onLogout}
        onCalendarClick={() => setShowCalendar(true)}
        onChatClick={() => setShowChatList(true)}
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