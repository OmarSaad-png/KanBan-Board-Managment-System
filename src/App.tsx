import { useState, useEffect } from 'react';
import Login from './components/Login';
import TeamLeaderDashboard from './components/dashboards/TeamLeaderDashboard';
import TeamMemberDashboard from './components/dashboards/TeamMemberDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import { User } from './utils/auth-types';
import { Task } from './utils/data-tasks';
import { fetchTasks, fetchUsers } from './utils/api';
import Loading from './components/common/Loading';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, usersData] = await Promise.all([
          fetchTasks(),
          fetchUsers()
        ]);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-lg mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  switch (user.role) {
    case 'team_leader':
      return (
        <TeamLeaderDashboard 
          user={user} 
          tasks={tasks} 
          users={users}
          onLogout={handleLogout}
        />
      );
    case 'team_member':
      return (
        <TeamMemberDashboard 
          user={user} 
          tasks={tasks.filter(t => t.assignee === user.id)}
          users={users}
          onLogout={handleLogout} 
        />
      );
    case 'client':
      return (
        <ClientDashboard 
          user={user} 
          tasks={tasks.filter(t => t.clientId === user.id)}
          users={users}
          onLogout={handleLogout} 
        />
      );
    default:
      return <div>Invalid role</div>;
  }
}

export default App;
