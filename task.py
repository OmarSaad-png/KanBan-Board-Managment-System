from datetime import datetime

class Task:
    def __init__(self, title, assignee, priority, deadline):
        self.id = id(self)
        self.title = title
        self.assignee = assignee
        self.priority = priority
        self.deadline = deadline
        self.dependencies = []
        self.status = "pending"

    def add_dependency(self, task):
        if task not in self.dependencies:
            self.dependencies.append(task)

class TaskManager:
    def __init__(self):
        self.tasks = {}

    def create_task(self, title, assignee, priority, deadline):
        task = Task(title, assignee, priority, deadline)
        self.tasks[task.id] = task
        return task.id

    def set_dependency(self, task_id, dependency_id):
        if task_id in self.tasks and dependency_id in self.tasks:
            self.tasks[task_id].add_dependency(self.tasks[dependency_id])
            return True
        return False

# Create a task manager
manager = TaskManager()

# Create two tasks
database_task = manager.create_task(
    "Setup Database",
    "John",
    "high",
    datetime(2024, 4, 1)
)

api_task = manager.create_task(
    "Create API",
    "Alice",
    "medium",
    datetime(2024, 4, 15)
)

# Make API task dependent on Database task
manager.set_dependency(api_task, database_task) 