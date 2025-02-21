'use client'

import { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { CheckIcon, PencilIcon, ShoppingCart, Trash2Icon, XIcon, SearchIcon, ChevronDown, Settings2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Constants
const MAX_ITEMS = 9999
const ITEMS_PER_PAGE = 50

interface ShoppingItem {
  id: number
  text: string
  completed: boolean
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  // Add any other fields your todos might have
}

// Add SortableItem component
function SortableItem({ item, isMultiSelectMode, selectedItems, toggleItemSelection, toggleItemCompletion, editingItemId, inputRef, newItemInputRef, saveButtonRef, editedItemText, updateItem, editItemValid, handleEditItemChange, startEditingItem, deleteItem }: { item: ShoppingItem, isMultiSelectMode: boolean, selectedItems: Set<number>, toggleItemSelection: (id: number) => void, toggleItemCompletion: (id: number) => void, editingItemId: number | null, inputRef: React.RefObject<HTMLInputElement>, newItemInputRef: React.RefObject<HTMLInputElement>, saveButtonRef: React.RefObject<HTMLButtonElement>, editedItemText: string, updateItem: () => void, editItemValid: boolean, handleEditItemChange: (e: ChangeEvent<HTMLInputElement>) => void, startEditingItem: (id: number, text: string) => void, deleteItem: (id: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-md border ${isDragging
        ? 'border-primary/50 bg-muted/50 shadow-md ring-1 ring-primary/20'
        : 'border-border/40 hover:border-border hover:bg-muted/20'
        } transition-all duration-200`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full w-8 cursor-move hidden sm:flex items-center justify-center rounded-l-md 
          bg-muted/30 text-muted-foreground/50 
          group-hover:bg-muted/50 group-hover:text-muted-foreground 
          active:bg-muted/70 transition-all
          sm:w-10"
        title="Drag to reorder"
      >
        <svg
          className="size-3.5 transition-transform duration-200 group-hover:scale-110 sm:size-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
      </div>
      <div className="flex flex-1 items-center justify-between gap-x-1 py-1.5 pl-2 pr-2 sm:py-2 sm:pl-12 sm:pr-2">
        <div className="flex flex-1 items-center gap-1.5 sm:gap-2">
          <Checkbox
            checked={isMultiSelectMode ? selectedItems.has(item.id) : item.completed}
            onCheckedChange={() => {
              if (isMultiSelectMode) {
                toggleItemSelection(item.id);
              } else {
                toggleItemCompletion(item.id);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="size-4 transition-transform duration-200 group-hover:scale-105 sm:size-5"
          />
          {editingItemId === item.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateItem();
              }}
              className="flex-1"
            >
              <Input
                ref={inputRef}
                type="text"
                value={editedItemText}
                className={`rounded-md border p-1 text-sm sm:text-base focus:ring-0 focus-visible:ring-0 ${!editItemValid ? 'border-red-500 ring-red-500' : ''}`}
                onChange={handleEditItemChange}
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <span
              className={`ml-0.5 flex-1 cursor-pointer text-sm sm:text-base text-gray-800 dark:text-gray-200 ${item.completed ? 'text-gray-500 line-through dark:text-gray-400' : ''
                }`}
              onClick={(e) => {
                e.stopPropagation();
                startEditingItem(item.id, item.text);
              }}
            >
              {item.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-x-1">
          {editingItemId === item.id && (
            <Button
              ref={saveButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                updateItem();
              }}
              className="h-7 w-7 rounded-md bg-green-500/80 p-0 font-medium text-white hover:bg-green-500 sm:h-8 sm:w-8"
              size={'icon'}
              variant={'outline'}
            >
              <CheckIcon className="size-4 sm:size-4" />
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(item.id);
            }}
            className="h-7 w-7 rounded-md bg-destructive/80 p-0 font-medium hover:bg-destructive sm:h-8 sm:w-8"
            size={'icon'}
            variant={'ghost'}
          >
            <Trash2Icon className="size-4 sm:size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ToDoList() {
  // State for items and pagination
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)

  // State for new item input
  const [newItem, setNewItem] = useState<string>('')
  const [newItemValid, setNewItemValid] = useState<boolean>(true)
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false)

  // State for editing
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editedItemText, setEditedItemText] = useState<string>('')
  const [editItemValid, setEditItemValid] = useState<boolean>(true)

  // State for dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [pendingText, setPendingText] = useState('')

  // Component mount state
  const [isMounted, setIsMounted] = useState<boolean>(false)

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null)
  const newItemInputRef = useRef<HTMLInputElement | null>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // Add new state for selected items
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  // Add state for multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)

  // Add state for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Add state for collapsible
  const [isOpen, setIsOpen] = useState(false)

  // Calculate pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Add sensors for drag handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load items on mount
  useEffect(() => {
    setIsMounted(true)
    const savedItems = localStorage.getItem('shoppingItems')
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [])

  // Save items to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('shoppingItems', JSON.stringify(items))
    }
  }, [items, isMounted])

  // Reset to first page when items length changes
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  // Handle clicks outside input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (newItemInputRef.current && !newItemInputRef.current.contains(target)) {
        setIsInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle clicks outside edit input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (saveButtonRef.current?.contains(target)) {
        return
      }

      if (editingItemId !== null && inputRef.current && !inputRef.current.contains(target)) {
        const currentItem = items.find(item => item.id === editingItemId)
        if (currentItem && editedItemText !== currentItem.text) {
          setShowSaveDialog(true)
          return
        }
        setEditingItemId(null)
        setEditedItemText('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editingItemId, editedItemText, items])

  // Item management functions
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

  const updateItem = (): void => {
    if (editingItemId === null) return

    if (editedItemText.trim().length < 1) {
      setEditItemValid(false)
      toast.error('Item name must be at least 1 character')
      return
    }

    setEditItemValid(true)
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === editingItemId
          ? { ...item, text: editedItemText.trim() }
          : item
      )
    )
    setEditingItemId(null)
    setEditedItemText('')
  }

  const toggleItemCompletion = (id: number): void => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
    setEditingItemId(null)
    setEditedItemText('')
  }

  const startEditingItem = (id: number, text: string): void => {
    if (editingItemId === id) return

    if (editingItemId !== null) {
      updateItem()
    }

    setEditingItemId(id)
    setEditedItemText(text)
    setEditItemValid(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const deleteItem = (id: number): void => {
    setItemToDelete(id)
    setShowDeleteDialog(true)
  }

  // Add selection handlers
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(id)) {
        newSelection.delete(id)
      } else {
        newSelection.add(id)
      }
      return newSelection
    })
  }

  const toggleSelectAll = () => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true)
    }
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)))
    }
  }

  const deleteSelectedItems = () => {
    setItems(items.filter(item => !selectedItems.has(item.id)))
    setSelectedItems(new Set())
    toast.success(`Deleted ${selectedItems.size} items`)
  }

  // Input handlers
  const handleNewItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value)
    setNewItemValid(e.target.value.trim().length >= 1)
  }

  const handleEditItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditedItemText(e.target.value)
    setEditItemValid(e.target.value.trim().length >= 1)
  }

  // Dialog handlers
  const handleDialogClose = (shouldSave: boolean) => {
    if (shouldSave) {
      updateItem()
    } else {
      setEditingItemId(null)
      setEditedItemText('')
    }

    if (pendingItemId !== null) {
      setEditingItemId(pendingItemId)
      setEditedItemText(pendingText)
      setEditItemValid(true)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }

    setShowSaveDialog(false)
    setPendingItemId(null)
    setPendingText('')
  }

  const handleDeleteConfirmation = (confirmed: boolean) => {
    if (confirmed && itemToDelete !== null) {
      setItems(items.filter((item) => item.id !== itemToDelete))
      toast.success('Item deleted')
    }
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  // Add handler for drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Filter and search todos
  const filteredTodos = useMemo(() => {
    return items
      .filter(item => {
        // Apply status filter
        if (filter === 'active') return !item.completed;
        if (filter === 'completed') return item.completed;
        return true;
      })
      .filter(item => {
        // Apply search filter
        return item.text.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [items, searchTerm, filter]);

  // Avoid SSR issues
  if (!isMounted) return null

  // JSX return statement rendering the todo list UI
  return (
    <div className="w-full max-w-2xl rounded-lg border border-border p-3 shadow-lg sm:p-4">
      {/* Header with title */}
      <h1 className="mb-2 flex items-center justify-between gap-x-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
        Shopping List
        <div className="relative rounded-full border border-border p-1.5 sm:p-2">
          <ShoppingCart className="size-5 sm:size-6" />
          {items.length > 0 && (
            <span
              className={`absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 inline-flex min-w-[18px] sm:min-w-[20px] items-center justify-center rounded-full bg-orange px-1 sm:px-1.5 py-0.5 text-xs font-medium text-white ${items.length > 99 ? 'min-w-[24px] sm:min-w-[28px]' : ''
                }`}
            >
              {items.length > 99 ? '99+' : items.length}
            </span>
          )}
        </div>
      </h1>

      {/* Input form */}
      <form className="mb-1 flex items-center gap-x-1" onSubmit={addItem}>
        <Input
          ref={newItemInputRef}
          type="text"
          placeholder="Add a new item"
          value={newItem}
          onChange={handleNewItemChange}
          onFocus={() => setIsInputFocused(true)}
          className={`text-sm h-8 ${isInputFocused
            ? !newItemValid
              ? 'border-red-500/60 ring-red-500/60'
              : 'border-green/60 ring-green/60'
            : 'border-border'
            }`}
        />
        <Button
          type="submit"
          className="h-8"
          variant={'outline'}
        >
          Add
        </Button>
      </form>

      {/* Search and Delete Multiple buttons */}
      <div className="mb-1 flex items-center gap-1">
        <div
          role="button"
          className="flex-1 flex items-center justify-between h-8 px-4 border rounded-md border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search and Filter</span>
            <span className="sm:hidden">Search</span>
            <Settings2 className="h-4 w-4 sm:hidden" />
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>

        {paginatedItems.length > 0 && !isMultiSelectMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMultiSelectMode(true)}
            className="h-8 whitespace-nowrap"
          >
            Delete Multiple
          </Button>
        )}
      </div>

      {/* Collapsible content */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-1 pt-1">
          {/* Search input */}
          <div className="space-y-1">
            <label htmlFor="search" className="text-xs font-medium">
              Search Items
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm h-8"
            />
          </div>

          {/* Filter buttons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">
                Filter by Status
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilter('all')
                  setIsOpen(false)
                }}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset filters
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-7 flex-1"
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('active')}
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                className="h-7 flex-1"
              >
                Active
              </Button>
              <Button
                onClick={() => setFilter('completed')}
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                className="h-7 flex-1"
              >
                Completed
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Move multi-select mode controls here if active */}
      {isMultiSelectMode && (
        <div className="mb-1 flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all items"
            className="size-4 sm:size-5"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {selectedItems.size} selected
          </span>
          <div className="ml-auto flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMultiSelectMode(false)
                setSelectedItems(new Set())
              }}
              className="h-7 sm:h-8 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            {selectedItems.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setItemToDelete(null)
                  setShowDeleteDialog(true)
                }}
                className="h-7 sm:h-8 text-xs sm:text-sm"
              >
                Delete Selected ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTodos}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {filteredTodos.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                isMultiSelectMode={isMultiSelectMode}
                selectedItems={selectedItems}
                toggleItemSelection={toggleItemSelection}
                toggleItemCompletion={toggleItemCompletion}
                editingItemId={editingItemId}
                inputRef={inputRef}
                newItemInputRef={newItemInputRef}
                saveButtonRef={saveButtonRef}
                deleteItem={deleteItem}
                editedItemText={editedItemText}
                updateItem={updateItem}
                editItemValid={editItemValid}
                handleEditItemChange={handleEditItemChange}
                startEditingItem={startEditingItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add a "no results" message */}
      {filteredTodos.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {items.length === 0
            ? "No items in the list"
            : "No items match your search"}
        </p>
      )}

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

      <Dialog open={showSaveDialog} onOpenChange={(open) => {
        if (!open) handleDialogClose(false)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Would you like to save them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
            >
              Discard
            </Button>
            <Button
              variant="default"
              onClick={() => handleDialogClose(true)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) handleDeleteConfirmation(false)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              {itemToDelete !== null
                ? "Are you sure you want to delete this item?"
                : `Are you sure you want to delete ${selectedItems.size} selected items?`}
              {" "}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete !== null) {
                  handleDeleteConfirmation(true)
                } else {
                  deleteSelectedItems()
                  setShowDeleteDialog(false)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
