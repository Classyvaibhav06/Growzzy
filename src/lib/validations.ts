import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'MANAGER', 'TEAM_MEMBER']).optional(),
})

// ─── Client ──────────────────────────────────────────────────────────────────
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial()

// ─── Project ─────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().optional()),
})

export const updateProjectSchema = createProjectSchema.partial()

// ─── Task ────────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  projectId: z.string().cuid('Invalid project ID').optional(),
  assigneeId: z.string().cuid('Invalid user ID').optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  deadline: z.string().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  deadline: z.string().optional().nullable(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
})

// ─── Check-in ────────────────────────────────────────────────────────────────
export const createCheckInSchema = z.object({
  yesterday: z.string().min(1, 'Yesterday field is required').max(2000),
  today: z.string().min(1, 'Today field is required').max(2000),
  blockers: z.string().max(1000).optional(),
})

export const reviewCheckInSchema = z.object({
  reviewNote: z.string().min(1, 'Review note cannot be empty').max(1000),
})

// ─── Contract ────────────────────────────────────────────────────────────────
export const createContractSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
})

export const generateContractSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  title: z.string().min(1),
  clientName: z.string().min(1, 'Client name is required'),
  contractText: z.string().min(10, 'Contract text must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

export const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
})

// ─── Invoice ─────────────────────────────────────────────────────────────────
export const createInvoiceSchema = z.object({
  clientId: z.string().cuid('Invalid client ID'),
  number: z.string().min(1, 'Invoice number is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
})

export const updateInvoiceSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
  dueDate: z.string().optional(),
  amount: z.number().positive().optional(),
})

// ─── Accounts ────────────────────────────────────────────────────────────────
export const createIncomeSchema = z.object({
  clientId: z.string().cuid().optional(),
  invoiceId: z.string().cuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  description: z.string().optional(),
})

export const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().optional(),
  description: z.string().optional(),
})
