import { User } from '../../utils/auth-types';

interface ChatListProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export default function ChatList({ currentUser, users, onSelectUser, onClose }: ChatListProps) {
  // Filter users based on role
  const availableUsers = users.filter(user => {
    if (currentUser.role === 'team_leader') {
      // Team leader can chat with everyone
      return user.id !== currentUser.id;
    } else if (currentUser.role === 'team_member') {
      // Team members can only chat with team leader
      return user.role === 'team_leader';
    } else if (currentUser.role === 'client') {
      // Clients can only chat with team leader
      return user.role === 'team_leader';
    }
    return false;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Start a Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-2">
          {availableUsers.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.role}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 