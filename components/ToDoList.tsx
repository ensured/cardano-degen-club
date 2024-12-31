'use client'

import { useState, useEffect, ChangeEvent, useRef } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { CheckIcon, PencilIcon, ShoppingCart, Trash2Icon } from 'lucide-react'

interface Task {
  id: number
  text: string
  completed: boolean
}

export default function ToDoList() {
  // State hooks for managing tasks, new task input, editing task, and component mount status
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<string>('')
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editedTaskText, setEditedTaskText] = useState<string>('')
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Effect hook to run on component mount
  useEffect(() => {
    setIsMounted(true) // Set mounted status to true
    // Load tasks from local storage
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks) as Task[]) // Parse and set tasks from local storage
    }
  }, [])

  // Effect hook to save tasks to local storage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks)) // Save tasks to local storage
    }
  }, [tasks, isMounted])

  // Function to add a new task
  const addTask = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (newTask.trim() !== '') {
      // Add the new task to the task list
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }])
      setNewTask('') // Clear the new task input
      inputRef.current?.focus()
    }
  }

  // Function to toggle the completion status of a task
  const toggleTaskCompletion = (id: number): void => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    setEditingTaskId(null)
    setEditedTaskText('')
  }

  // Function to start editing a task
  const startEditingTask = (id: number, text: string): void => {
    setEditingTaskId(id) // Set the task ID being edited
    setEditedTaskText(text) // Set the text of the task being edited
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Function to update an edited task
  const updateTask = (): void => {
    if (editedTaskText.trim() === '') {
      toast.error('Input cannot be empty')
    } else {
      // Update the task text
      setTasks(tasks.map((task) => (task.id === editingTaskId ? { ...task, text: editedTaskText } : task)))
      setEditingTaskId(null) // Clear the editing task ID
      setEditedTaskText('') // Clear the edited task text
    }
  }

  // Function to delete a task
  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task) => task.id !== id)) // Filter out the task to be deleted
  }

  // Avoid rendering on the server to prevent hydration errors
  if (!isMounted) {
    return null
  }

  // JSX return statement rendering the todo list UI
  return (
    <div className="w-full max-w-md rounded-lg border border-border p-6 shadow-lg">
      {/* Header with title */}
      <h1 className="mb-4 flex items-center justify-between gap-x-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
        Shopping List App
        <div className="relative rounded-full border border-border p-2">
          <ShoppingCart className="size-6" />
          {tasks.length > 0 && (
            <span className="absolute -right-1 -top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-orange text-sm text-white">
              {tasks.length}
            </span>
          )}
        </div>
      </h1>
      {/* Input for adding new tasks */}
      <form className="mb-4 flex items-center" onSubmit={addTask}>
        <Input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={
            (e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value) // Update new task input
          }
          className="mr-2 flex-1 rounded-md border px-3 py-2"
        />
        <Button type="submit" className="rounded-md px-4 py-2 font-medium" variant={'outline'}>
          Add
        </Button>
      </form>
      {/* List of tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex flex-1 items-center justify-between gap-x-1 rounded-md">
            <div className="flex flex-1 items-center">
              {/* Checkbox to toggle task completion */}
              <Checkbox
                checked={task.completed}
                className="mr-2"
                onCheckedChange={() => toggleTaskCompletion(task.id)}
              />
              {editingTaskId === task.id ? (
                // Input for editing task text
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    updateTask()
                  }}
                  className="flex-1"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    value={editedTaskText}
                    className="rounded-md border p-1 text-base"
                    onChange={
                      (e: ChangeEvent<HTMLInputElement>) => setEditedTaskText(e.target.value) // Update edited task text
                    }
                  />
                </form>
              ) : (
                // Display task text with click to edit functionality
                <span
                  className={`ml-1 flex-1 text-gray-800 dark:text-gray-200 ${
                    task.completed ? 'text-gray-500 line-through dark:text-gray-400' : ''
                  }`}
                  onClick={() => startEditingTask(task.id, task.text)} // Trigger editing on click
                >
                  {task.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-1">
              {editingTaskId === task.id ? (
                // Button to save edited task
                <Button
                  onClick={updateTask}
                  className="rounded-md bg-green/80 px-2 py-1 font-medium text-white hover:bg-green hover:text-white"
                  variant="outline"
                >
                  <CheckIcon className="size-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => startEditingTask(task.id, task.text)}
                  className="rounded-md px-2 py-1 font-medium"
                  variant="outline"
                >
                  <PencilIcon className="size-5" />
                </Button>
              )}
              <Button
                onClick={() => deleteTask(task.id)}
                className="rounded-md bg-destructive/80 px-2 py-1 font-medium hover:bg-destructive"
                size={'icon'}
              >
                <Trash2Icon className="size-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
