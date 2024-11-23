import { useState } from 'react';
import { Task, Priority } from '../../utils/data-tasks';
import { User } from '../../utils/auth-types';

interface NewTaskModalProps {
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => Promise<void>;
  teamMembers: User[];
  clients: { id: string; name: string; }[];
  currentUser: User;
  availableTasks: Task[];
}

interface FormErrors {
  title?: string;
  points?: number;
}

type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13;

const FIBONACCI_POINTS: StoryPoints[] = [1, 2, 3, 5, 8, 13];

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1
};

const calculateDueDate = (priority: Priority): string => {
  const today = new Date();
  switch (priority) {
    case 'high':
      today.setDate(today.getDate() + 3); // 3 days for high priority
      break;
    case 'medium':
      today.setDate(today.getDate() + 7); // 7 days for medium priority
      break;
    case 'low':
      today.setDate(today.getDate() + 14); // 14 days for low priority
      break;
  }
  return today.toISOString();
};

export default function NewTaskModal({ 
  onClose, 
  onSubmit, 
  teamMembers, 
  clients,
  currentUser,
  availableTasks 
}: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [points, setPoints] = useState<StoryPoints>(1);
  const [assignee, setAssignee] = useState<string>(teamMembers[0]?.id || '');
  const [clientId, setClientId] = useState<string>(clients[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dependsOn, setDependsOn] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.length > 50) {
      newErrors.title = 'Title must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get incomplete tasks for dependencies, sorted by priority
  const incompleteTasks = availableTasks
    .filter(task => 
      task.status !== 'done' &&
      task.approvalStatus !== 'approved'
    )
    .sort((a, b) => {
      // Sort by priority
      const priorityOrder: Record<Priority, number> = {
        high: 3,
        medium: 2,
        low: 1
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // If there's a dependency, set priority at least as high as dependent task
    let finalPriority = priority;
    if (dependsOn) {
      const dependentTask = availableTasks.find(t => t.id === dependsOn);
      if (dependentTask && PRIORITY_ORDER[dependentTask.priority] > PRIORITY_ORDER[priority]) {
        finalPriority = dependentTask.priority;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        priority: finalPriority,
        points,
        status: 'todo',
        assignee,
        clientId,
        createdBy: currentUser.id,
        dependsOn: dependsOn || undefined,
        dueDate: calculateDueDate(finalPriority)
      });
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Clear error when user starts typing
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
                ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Story Points</label>
            <div className="mt-1 flex gap-2">
              {FIBONACCI_POINTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPoints(value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${points === value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className={`mt-1 text-s
              ${points === 1 && 'text-green-600'}
              ${points === 2 && 'text-green-700'} 
              ${points === 3 && 'text-yellow-600'}
              ${points === 5 && 'text-yellow-700'}
              ${points === 8 && 'text-orange-600'}
              ${points === 13 && 'text-red-600'}
            `}>
              {points === 1 && "Very simple task"}
              {points === 2 && "Simple task"}
              {points === 3 && "Medium task"}
              {points === 5 && "Complex task"}
              {points === 8 && "Very complex task"}
              {points === 13 && "Extremely complex task"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assign To</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Depends On (Optional)
            </label>
            <select
              value={dependsOn}
              onChange={(e) => setDependsOn(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">No Dependency</option>
              {incompleteTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.id} - {task.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}