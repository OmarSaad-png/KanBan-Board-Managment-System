import { useCallback, useEffect, useState } from 'react'
import TaskCard from './components/TaskCard'
import { Status, statuses, Task, Column } from './utils/data-tasks'
import { fetchTasks, updateTaskAPI } from './utils/api'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentlyHoveringOver, setCurrentlyHoveringOver] = useState<Status | null>(null)

  const columns: Column[] = statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status)
  }))

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks()
        setTasks(data)
      } catch (err) {
        setError('Failed to load tasks')
      } finally {
        setIsLoading(false)
      }
    }
    loadTasks()
  }, [])

  const updateTask = useCallback(async (task: Task) => {
    try {
      await updateTaskAPI(task)
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    } catch (err) {
      setError('Failed to update task')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>, status: Status) => {
    e.preventDefault()
    setCurrentlyHoveringOver(null)
    const id = e.dataTransfer.getData("id")
    const task = tasks.find((task) => task.id === id)
    if(task) {
      updateTask({...task, status})
    }
  }, [tasks, updateTask])

  if (isLoading) return <div className="flex justify-center p-8">Loading...</div>
  if (error) return <div className="flex justify-center p-8 text-red-500">{error}</div>

  return (
    <main className="flex divide-x min-h-screen">
      {columns.map((column) => (
        <section
          key={column.status}
          className="flex-1 p-4"
          onDrop={(e) => handleDrop(e, column.status)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setCurrentlyHoveringOver(column.status)}
          aria-label={`${column.status} tasks`}
        >
          <div className="flex justify-between text-3xl p-2 font-bold text-gray-500">
            <h2 className="capitalize">{column.status}</h2>
            <span>{column.tasks.reduce((total, task) => total + (task?.points || 0), 0)}</span>
          </div>
          <div 
            className={`min-h-[200px] rounded-lg transition-colors ${
              currentlyHoveringOver === column.status ? 'bg-gray-100' : ''
            }`}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                updateTask={updateTask}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}

export default App
