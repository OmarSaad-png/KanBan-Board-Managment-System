interface HeaderProps {
  title: string;
  userName: string;
  onLogout: () => void;
  children?: React.ReactNode;
}

export default function Header({ title, userName, onLogout, children }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">Welcome, {userName}</p>
          </div>
          <div className="flex items-center gap-6">
            {children}
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 