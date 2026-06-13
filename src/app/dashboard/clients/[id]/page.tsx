"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, ArrowLeft, Briefcase, FileText, Receipt, CheckCircle2, Clock, Plus, X, Loader2 } from 'lucide-react'

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`)
      const data = await res.json()
      if (data.client) {
        setClient(data.client)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchClient()
    }
  }, [params.id])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.id,
          name: projectName,
          description: projectDesc,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        })
      })
      const data = await res.json()
      if (data.project) {
        setIsProjectModalOpen(false)
        setProjectName('')
        setProjectDesc('')
        setStartDate('')
        setEndDate('')
        fetchClient() // Refresh the data
      } else {
        alert(data.error || 'Failed to create project')
      }
    } catch (e) {
      alert('An error occurred while creating the project')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading client profile...</div>
  }

  if (!client) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Client not found. <button onClick={() => router.back()} className="text-primary hover:underline">Go back</button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div>
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clients
        </button>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary uppercase border-2 border-primary/20">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              {client.company && (
                <div className="flex items-center text-muted-foreground mt-1 gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span className="text-lg">{client.company}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium">
              Edit Client
            </button>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
              Log Update
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact & Notes */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            <div className="space-y-4">
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${client.email}`} className="text-sm text-primary hover:underline">{client.email}</a>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={`tel:${client.phone}`} className="text-sm text-primary hover:underline">{client.phone}</a>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{client.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-lg mb-4">Internal Notes</h3>
            {client.notes ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No internal notes added.</p>
            )}
          </div>
        </div>

        {/* Right Column: Historical Data Tabs (Simulated with stacked sections for now) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Projects & Tasks Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Active Projects
              </h2>
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
            
            <div className="space-y-4">
              {client.projects && client.projects.length > 0 ? (
                client.projects.map((project: any) => (
                  <div key={project.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.description && <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>}
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full bg-primary/10 text-primary">
                        {project.status}
                      </span>
                    </div>
                    <div className="p-4">
                      {project.tasks && project.tasks.length > 0 ? (
                        <ul className="space-y-3">
                          {project.tasks.map((task: any) => (
                            <li key={task.id} className="flex items-center justify-between text-sm hover:bg-muted/30 p-2 -mx-2 rounded-md transition-colors">
                              <div className="flex items-center gap-2">
                                {task.status === 'COMPLETED' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                )}
                                <span className={task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : 'font-medium'}>
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase font-bold">{task.status.replace('_', ' ')}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center py-4 text-center">
                          <p className="text-sm text-muted-foreground mb-2">No tasks assigned yet.</p>
                          <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">Go to Tasks board to assign tasks</Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-border border-dashed p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Briefcase className="w-8 h-8 mb-3 opacity-20" />
                  <p>No projects created for this client yet.</p>
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="mt-4 text-primary text-sm hover:underline"
                  >
                    Create their first project
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Contracts Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Contracts
              </h2>
              <Link href="/dashboard/contracts" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {client.contracts && client.contracts.length > 0 ? (
                <div className="divide-y divide-border">
                  {client.contracts.map((contract: any) => (
                    <div key={contract.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{contract.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(contract.createdAt).toLocaleDateString()} • ${contract.value.toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-muted text-muted-foreground">
                        {contract.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No contracts found.</div>
              )}
            </div>
          </section>

          {/* Invoices Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-500" />
                Invoices
              </h2>
              <Link href="/dashboard/invoices" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {client.invoices && client.invoices.length > 0 ? (
                <div className="divide-y divide-border">
                  {client.invoices.map((invoice: any) => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium text-sm">#{invoice.number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Due {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${invoice.amount.toLocaleString()}</p>
                        <span className={`text-[10px] uppercase font-bold ${
                          invoice.status === 'PAID' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No invoices generated yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Create Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-lg rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold tracking-tight">Create New Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Project Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea 
                  placeholder="Brief overview of the project goals..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Target End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !projectName}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
