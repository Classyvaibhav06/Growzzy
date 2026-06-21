"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
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

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the task "${title}"?`)) return

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchTasks()
      } else {
        alert(data.error || 'Failed to delete task')
      }
    } catch (e) {
      console.error(e)
      alert('An error occurred while deleting the task')
    }
  }

  // Simplified UI for Kanban columns
  const columns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']

  if (!isMounted) return null;

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between pb-6 border-b border-[#f4f5f7] shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Tasks</h2>
          <p className="text-[#6b7280] text-sm mt-1">Manage projects and assign tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#f4f5f7] border border-[#e5e7eb] p-1 rounded-xl flex shadow-sm">
            <button 
              onClick={() => setView('kanban')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${view === 'kanban' ? 'bg-white shadow-sm font-bold text-[#111827]' : 'text-[#6b7280] hover:text-[#111827] font-medium'}`}
            >
              Board
            </button>
            <button 
              onClick={() => setView('table')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${view === 'table' ? 'bg-white shadow-sm font-bold text-[#111827]' : 'text-[#6b7280] hover:text-[#111827] font-medium'}`}
            >
              Table
            </button>
          </div>
          {currentUser?.role !== 'TEAM_MEMBER' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold ml-2 flex items-center shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
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
                <div key={status} className="w-80 flex flex-col bg-[#f4f5f7] rounded-[24px] p-4 min-h-[600px]">
                  <h3 className="font-bold text-sm mb-4 flex items-center justify-between text-[#111827] px-1">
                    {status.replace('_', ' ')}
                    <span className="bg-white text-[#111827] text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                      {isPageLoading ? <Skeleton className="h-4 w-4" /> : tasks.filter(t => t.status === status).length}
                    </span>
                  </h3>
                  
                  {isPageLoading ? (
                    <div className="flex-1 space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm">
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
                          className={`flex-1 space-y-4 overflow-y-auto px-1 pb-4 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-[#e6e9f0]' : ''}`}
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
                                  className={`bg-white p-5 rounded-[20px] shadow-sm ${isDragDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing transition-all hover:shadow-md'} ${snapshot.isDragging ? 'ring-2 ring-[#2563eb] shadow-lg opacity-95' : ''}`}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                                        task.priority === 'HIGH' || task.priority === 'URGENT' 
                                          ? 'bg-red-50 text-red-700' 
                                          : 'bg-[#f4f5f7] text-[#111827]'
                                      }`}>
                                        {task.priority}
                                      </span>
                                      {task.project && (
                                        <span className="text-[10px] text-[#6b7280] font-medium max-w-[120px] truncate">
                                          {task.project.name}
                                        </span>
                                      )}
                                    </div>
                                    {currentUser?.role !== 'TEAM_MEMBER' && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id, task.title); }}
                                        className="text-[#6b7280] hover:text-red-600 transition-colors p-1" 
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-sm mb-1 text-[#111827]">{task.title}</h4>
                                  <p className="text-xs text-[#6b7280] line-clamp-2 mb-4 leading-relaxed">
                                    {task.description || 'No description provided.'}
                                  </p>
                                  <div className="flex justify-between items-center mt-2 border-t border-[#f4f5f7] pt-3">
                                    <div className="h-7 w-7 rounded-full bg-[#f4f5f7] flex items-center justify-center text-[10px] font-bold text-[#111827]" title={task.assignee?.name || 'Unassigned'}>
                                      {task.assignee?.name?.charAt(0) || '?'}
                                    </div>
                                    {task.deadline && (
                                      <span className="text-[10px] font-medium text-[#6b7280]">
                                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                            <div className="h-24 rounded-2xl border-2 border-dashed border-[#e5e7eb] flex items-center justify-center text-xs font-medium text-[#6b7280] pointer-events-none">
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
        <div className="rounded-[24px] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#111827]">
              <thead className="text-xs text-[#6b7280] bg-[#f4f5f7] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f5f7]">
                {isPageLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="hover:bg-[#f8f9fc]/50">
                      <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-6 py-4 flex justify-end"><Skeleton className="h-8 w-8 rounded-md" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#6b7184] font-medium">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.id} className="hover:bg-[#f4f5f7] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#111827]">{task.title}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{task.project?.name || '-'}</td>
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
                          className={`bg-[#f4f5f7] text-[#111827] px-3 py-1.5 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#2563eb] focus:border-transparent outline-none border-none ${currentUser?.role === 'TEAM_MEMBER' && task.assigneeId !== currentUser.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          task.priority === 'HIGH' || task.priority === 'URGENT' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-[#f4f5f7] text-[#111827]'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#111827] font-medium">{task.assignee?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-[#6b7280]">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentUser?.role !== 'TEAM_MEMBER' && (
                          <button 
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-2 text-[#6b7280] hover:text-red-600 transition-colors rounded-md hover:bg-red-50" 
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4 ml-auto" />
                          </button>
                        )}
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
        <div className="fixed inset-0 z-50 bg-[#111827]/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl rounded-[24px] w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#f4f5f7]">
              <h3 className="text-lg font-bold tracking-tight text-[#111827]">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6b7280] hover:text-[#111827] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">Task Title <span className="text-[#f03e3e]">*</span></label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Design homepage wireframes"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111827]">Description</label>
                <textarea 
                  placeholder="Additional details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full flex min-h-[80px] rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#111827]">Project</label>
                  <select 
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  >
                    <option value="">No Project (Standalone)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#111827]">Assign To</label>
                  <select 
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#111827]">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#111827]">Deadline</label>
                  <input 
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className="w-full flex h-10 rounded-xl border border-[#e5e7eb] bg-[#f4f5f7]/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-[#f4f5f7] mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#f4f5f7] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newTask.title}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
