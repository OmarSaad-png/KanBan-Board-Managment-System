import { useState } from 'react';
import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';
import KanbanBoard from '../KanbanBoard';
import Header from '../common/Header';
import NewTaskModal from '../modals/NewTaskModal';
import { createTask, deleteTask, updateTaskAPI } from '../../utils/api';

interface TeamLeaderDashboardProps {
  user: User;
  tasks: Task[];
  users: User[];
  onLogout: () => void;
}

export default function TeamLeaderDashboard({ 
  user, 
  tasks: initialTasks, 
  users,
  onLogout 
}: TeamLeaderDashboardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('all');

  const teamMembers = users.filter(u => u.role === 'team_member');
  const clients = users.filter(u => u.role === 'client');

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateTaskAPI(updatedTask);
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const filteredTasks = selectedMember === 'all' 
    ? tasks 
    : tasks.filter(task => task.assignee === selectedMember);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        title="Team Leader Dashboard" 
        userName={user.name}
        onLogout={onLogout}
      >
        <div className="flex items-center gap-4">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
              hover:bg-blue-700 rounded-md transition-colors"
          >
            New Task
          </button>
          
          <div className="text-sm border-l pl-4">
            <p>Total Tasks: {filteredTasks.length}</p>
            <p>Completed: {filteredTasks.filter(t => t.status === 'done').length}</p>
          </div>
        </div>
      </Header>

      <main className="flex-1 overflow-auto">
        <KanbanBoard 
          tasks={filteredTasks} 
          user={user} 
          users={users}
          onTaskUpdate={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleCreateTask}
          teamMembers={teamMembers}
          clients={clients}
          currentUser={user}
        />
      )}
    </div>
  );
} 