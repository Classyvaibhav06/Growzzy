"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Skeleton } from '@/components/ui/skeleton'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [isMounted, setIsMounted] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    assigneeId: '',
    projectId: ''
  })

  useEffect(() => {
    setIsMounted(true)
    Promise.all([fetchTasks(), fetchProjects(), fetchUsers(), fetchCurrentUser()]).finally(() => {
      setIsPageLoading(false)
    })
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me')
      const data = await res.json()
      if (data.user) setCurrentUser(data.user)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (data.tasks) setTasks(data.tasks)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) setProjects(data.projects)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        title: newTask.title,
        priority: newTask.priority,
      }
      if (newTask.description) payload.description = newTask.description
      if (newTask.deadline) payload.deadline = new Date(newTask.deadline).toISOString()
      if (newTask.assigneeId) payload.assigneeId = newTask.assigneeId
      if (newTask.projectId) payload.projectId = newTask.projectId

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (data.task) {
        setIsModalOpen(false)
        setNewTask({ title: '', description: '', priority: 'MEDIUM', deadline: '', assigneeId: '', projectId: '' })
        fetchTasks()
      } else {
        alert(data.error || 'Failed to create task')
      }
    } catch (e) {
      alert('An error occurred while creating the task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If dropped outside a droppable area, do nothing
    if (!destination) return

    // If dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId

    // Optimistically update the UI instantly
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    ))

    // Send the PATCH request in the background
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        // If it fails, fetch the real state back
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
      fetchTasks()
    }
  }

  // Simplified UI for Kanban columns
  const columns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']

  if (!isMounted) return null;

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground text-sm">Manage projects and assign tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-md flex">
            <button 
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${view === 'kanban' ? 'bg-background shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Board
            </button>
            <button 
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${view === 'table' ? 'bg-background shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Table
            </button>
          </div>
          {currentUser?.role !== 'TEAM_MEMBER' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium ml-2 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Task
            </button>
          )}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full min-w-max">
              {columns.map(status => (
                <div key={status} className="w-80 flex flex-col bg-muted/30 rounded-xl border border-border p-4 h-full">
                  <h3 className="font-semibold text-sm mb-4 flex items-center justify-between">
                    {status.replace('_', ' ')}
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                      {isPageLoading ? <Skeleton className="h-4 w-4" /> : tasks.filter(t => t.status === status).length}
                    </span>
                  </h3>
                  
                  {isPageLoading ? (
                    <div className="flex-1 space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-card border border-border p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full mb-1" />
                          <Skeleton className="h-3 w-5/6 mb-4" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                          className="flex-1 space-y-3 overflow-y-auto"
                        >
                          {tasks.filter(t => t.status === status).map((task, index) => {
                            const isDragDisabled = currentUser?.role === 'TEAM_MEMBER' && task.assigneeId !== currentUser.id
                            
                            return (
                            <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-card border border-border p-4 rounded-lg shadow-sm ${isDragDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors'} ${snapshot.isDragging ? 'ring-2 ring-primary shadow-xl opacity-90' : ''}`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${
                                      task.priority === 'HIGH' || task.priority === 'URGENT' 
                                        ? 'bg-destructive/10 text-destructive' 
                                        : 'bg-primary/10 text-primary'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    {task.project && (
                                      <span className="text-[10px] text-muted-foreground max-w-[120px] truncate">
                                        {task.project.name}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {task.description || 'No description provided.'}
                                  </p>
                                  <div className="flex justify-between items-center mt-2">
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold" title={task.assignee?.name || 'Unassigned'}>
                                      {task.assignee?.name?.charAt(0) || '?'}
                                    </div>
                                    {task.deadline && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {new Date(task.deadline).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                            )
                          })}
                          {provided.placeholder}
                          {tasks.filter(t => t.status === status).length === 0 && !snapshot?.isDraggingOver && (
                            <div className="h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
                              Drop here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Task</th>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Assignee</th>
                  <th className="px-6 py-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {isPageLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{task.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{task.project?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={task.status}
                          disabled={currentUser?.role === 'TEAM_MEMBER' && task.assigneeId !== currentUser.id}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
                            try {
                              await fetch(`/api/tasks/${task.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: newStatus })
                              })
                            } catch(err) {
                              fetchTasks()
                            }
                          }}
                          className={`bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs border-none focus:ring-0 ${currentUser?.role === 'TEAM_MEMBER' && task.assigneeId !== currentUser.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{task.priority}</td>
                      <td className="px-6 py-4">{task.assignee?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Task Title <span className="text-destructive">*</span></label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Design homepage wireframes"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  placeholder="Additional details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Project</label>
                  <select 
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">No Project (Standalone)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Assign To</label>
                  <select 
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Deadline</label>
                  <input 
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newTask.title}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
