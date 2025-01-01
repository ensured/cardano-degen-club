'use client'

import { useState, useEffect, ChangeEvent, useRef } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { CheckIcon, PencilIcon, ShoppingCart, Trash2Icon, PlusIcon, XIcon } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface ShoppingItem {
  id: number
  text: string
  completed: boolean
}

export default function ToDoList() {
  // State hooks for managing items, new item input, editing item, and component mount status
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState<string>('')
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editedItemText, setEditedItemText] = useState<string>('')
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [newItemValid, setNewItemValid] = useState<boolean>(true)
  const [editItemValid, setEditItemValid] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 25

  // Add constant for max items
  const MAX_ITEMS = 9999

  // Add new state for input focus
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false)
  const newItemInputRef = useRef<HTMLInputElement | null>(null)

  // Effect hook to run on component mount
  useEffect(() => {
    setIsMounted(true) // Set mounted status to true
    // Load items from local storage
    const savedItems = localStorage.getItem('shoppingItems')
    if (savedItems) {
      setItems(JSON.parse(savedItems) as ShoppingItem[]) // Parse and set items from local storage
    }
  }, [])

  // Effect hook to save items to local storage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('shoppingItems', JSON.stringify(items)) // Save items to local storage
    }
  }, [items, isMounted])

  // Add useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (editingItemId !== null && inputRef.current && !inputRef.current.contains(target)) {
        setEditingItemId(null)
        setEditedItemText('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingItemId])

  // Add new useEffect for handling clicks outside the main input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (newItemInputRef.current && !newItemInputRef.current.contains(target)) {
        setIsInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Function to add a new item
  const addItem = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (newItem.trim().length < 1) {
      setNewItemValid(false)
      toast.error('Item name must be at least 1 character')
      return
    }
    if (items.length >= MAX_ITEMS) {
      toast.error(`Maximum limit of ${MAX_ITEMS.toLocaleString()} items reached`)
      return
    }
    setNewItemValid(true)
    setItems([...items, { id: Date.now(), text: newItem, completed: false }])
    setNewItem('')
    inputRef.current?.focus()
  }

  // Function to toggle the completion status of a item
  const toggleItemCompletion = (id: number): void => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    setEditingItemId(null)
    setEditedItemText('')
  }

  // Function to start editing a item
  const startEditingItem = (id: number, text: string): void => {
    setEditingItemId(id) // Set the item ID being edited
    setEditedItemText(text) // Set the text of the item being edited
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Function to update an edited item
  const updateItem = (): void => {
    if (editedItemText.trim().length < 1) {
      setEditItemValid(false)
      toast.error('Item name must be at least 1 character')
      return
    }
    setEditItemValid(true)
    setItems(items.map((item) => (item.id === editingItemId ? { ...item, text: editedItemText } : item)))
    setEditingItemId(null)
    setEditedItemText('')
  }

  // Function to delete a item
  const deleteItem = (id: number): void => {
    setItems(items.filter((item) => item.id !== id)) // Filter out the item to be deleted
  }

  // Add validation handlers for input changes
  const handleNewItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value)
    setNewItemValid(e.target.value.trim().length >= 1)
  }

  const handleEditItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedItemText(e.target.value)
    setEditItemValid(e.target.value.trim().length >= 1)
  }

  // Clear all items
  const clearAllItems = (): void => {
    setItems([])
    toast.success('Cleared all items')
  }

  // Pagination calculation
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Effect to reset to first page when items length changes
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  // Avoid rendering on the server to prevent hydration errors
  if (!isMounted) {
    return null
  }

  // JSX return statement rendering the todo list UI
  return (
    <div className="w-full max-w-md rounded-lg border border-border p-6 shadow-lg">
      {/* Header with title */}
      <h1 className="mb-4 flex items-center justify-between gap-x-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
        Shopping List
        <div className="flex items-center gap-x-2">
          <Button onClick={clearAllItems} className="flex items-center gap-x-2" variant="outline" size="sm">
            <XIcon className="size-4" />
            Clear All
          </Button>
          <div className="relative rounded-full border border-border p-2">
            <ShoppingCart className="size-6" />
            {items.length > 0 && (
              <span
                className={`absolute -right-2 -top-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-orange px-1.5 py-0.5 text-xs font-medium text-white ${
                  items.length > 99 ? 'min-w-[28px]' : ''
                }`}
              >
                {items.length > 99 ? items.length : items.length}
              </span>
            )}
          </div>
        </div>
      </h1>

      {/* Input for adding new items */}
      <form className="mb-4 flex items-center" onSubmit={addItem}>
        <Input
          ref={newItemInputRef}
          type="text"
          placeholder="Add a new item"
          value={newItem}
          onChange={handleNewItemChange}
          onFocus={() => setIsInputFocused(true)}
          className={`mr-2 flex-1 rounded-md border px-3 py-2 outline-none focus:ring-0 focus-visible:ring-0 ${
            isInputFocused
              ? !newItemValid
                ? 'border-red-500/60 ring-red-500/60'
                : 'border-green/60 ring-green/60'
              : 'border-border'
          }`}
        />
        <Button type="submit" className="rounded-md px-4 py-2 font-medium" variant={'outline'}>
          Add
        </Button>
      </form>
      {/* List of items */}
      <div className="space-y-2">
        {paginatedItems.map((item) => (
          <div key={item.id} className="flex flex-1 items-center justify-between gap-x-1 rounded-md">
            <div className="flex flex-1 items-center">
              {/* Checkbox to toggle item completion */}
              <Checkbox
                checked={item.completed}
                className="mr-2"
                onCheckedChange={() => toggleItemCompletion(item.id)}
              />
              {editingItemId === item.id ? (
                // Input for editing item text
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    updateItem()
                  }}
                  className="flex-1"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    value={editedItemText}
                    className={`rounded-md border p-1 text-base focus:ring-0 focus-visible:ring-0 ${
                      !editItemValid ? 'border-red-500 ring-red-500' : ''
                    }`}
                    onChange={handleEditItemChange}
                  />
                </form>
              ) : (
                // Display item text with click to edit functionality
                <span
                  className={`ml-1 flex-1 text-gray-800 dark:text-gray-200 ${
                    item.completed ? 'text-gray-500 line-through dark:text-gray-400' : ''
                  }`}
                  onClick={() => startEditingItem(item.id, item.text)} // Trigger editing on click
                >
                  {item.text}
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-1">
              {editingItemId === item.id ? (
                <Button
                  onClick={updateItem}
                  className="rounded-md bg-green/80 px-2 py-1 font-medium text-white hover:bg-green hover:text-white"
                  variant="outline"
                >
                  <CheckIcon className="size-5" />
                </Button>
              ) : (
                <Button
                  onClick={() => startEditingItem(item.id, item.text)}
                  className="rounded-md px-2 py-1 font-medium"
                  variant="outline"
                >
                  <PencilIcon className="size-5" />
                </Button>
              )}
              <Button
                onClick={() => deleteItem(item.id)}
                className="rounded-md bg-destructive/80 px-2 py-1 font-medium hover:bg-destructive"
                size={'icon'}
              >
                <Trash2Icon className="size-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add pagination component at the bottom */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none select-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1
                // Always show first page, last page, and 3 pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer select-none"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  // Show ellipsis only once between gaps
                  (pageNumber === 2 && currentPage > 4) ||
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 3)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={
                    currentPage === totalPages ? 'pointer-events-none select-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
