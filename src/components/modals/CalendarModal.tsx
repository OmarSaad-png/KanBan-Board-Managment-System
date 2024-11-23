import { Task } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';

interface CalendarModalProps {
  onClose: () => void;
  tasks: Task[];
  user: User;
  users: User[];
}

export default function CalendarModal({ onClose, tasks, user, users }: CalendarModalProps) {
  // Filter tasks based on user role
  const visibleTasks = user.role === 'team_leader' 
    ? tasks 
    : tasks.filter(task => task.assignee === user.id);

  // Group tasks by due date
  const tasksByDate = visibleTasks.reduce((acc, task) => {
    const date = new Date(task.dueDate).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const findUserName = (userId?: string) => {
    return users.find(u => u.id === userId)?.name || 'Unassigned';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Task Calendar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(tasksByDate)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, dateTasks]) => (
              <div key={date} className="border-b pb-4">
                <h3 className="font-semibold mb-2">{date}</h3>
                <div className="space-y-2">
                  {dateTasks.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-mono text-sm text-gray-500 mr-2">
                          {task.id}
                        </span>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      {user.role === 'team_leader' && (
                        <span className="text-sm text-gray-600">
                          {findUserName(task.assignee)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 