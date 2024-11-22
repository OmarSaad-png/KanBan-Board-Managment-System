import { useState } from 'react'
import { Task } from '../utils/data-tasks'

interface TaskCardProps {
  task: Task
  updateTask: (task: Task) => Promise<void>
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const

const TaskCard = ({ task, updateTask }: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('id', task.id)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        p-4 mb-3 rounded-lg shadow-sm border border-gray-200
        bg-white cursor-move transition-all
        hover:shadow-md
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 font-mono">{task.id}</span>
        <span 
          className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${priorityColors[task.priority]}
          `}
        >
          {task.priority}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      
      {task.points && (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center justify-center w-6 h-6 
            rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
            {task.points}
          </span>
        </div>
      )}
    </div>
  )
}

export default TaskCard