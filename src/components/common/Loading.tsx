interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function Loading({ size = 'medium', message = 'Loading...' }: LoadingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`} />
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
} 