import { useState, useEffect } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import ChatWindow from '../chat/ChatWindow';
import ChatList from '../chat/ChatList';

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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showChatList, setShowChatList] = useState(false);
  const [currentChat, setCurrentChat] = useState<User | null>(null);
  const [ws] = useState(() => new WebSocket('ws://localhost:3001'));
  
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleChatSelect = (selectedUser: User) => {
    setCurrentChat(selectedUser);
    setShowChatList(false);
  };

  const progress = Math.round(
    (tasks.filter(t => t.status === 'done' && t.approvalStatus === 'approved').length / tasks.length) * 100
  );

  console.log('Tasks for client:', tasks);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Project Overview" 
        userName={user.name}
        userRole={user.role}
        onLogout={onLogout}
        onChatClick={() => setShowChatList(true)}
        onCalendarClick={() => {}}
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