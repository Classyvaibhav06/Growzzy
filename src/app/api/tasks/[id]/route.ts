import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { updateTaskSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, clientId: true } },
        assignee: { select: { id: true, name: true, avatar: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!task) return errorResponse('Task not found', 404)

    // Team members can only view tasks assigned to or created by them
    if (
      session!.role === Role.TEAM_MEMBER &&
      task.assigneeId !== session!.userId &&
      task.createdById !== session!.userId
    ) {
      return errorResponse('Forbidden', 403)
    }

    return successResponse({ task })
  } catch (e) {
    console.error('[GET /api/tasks/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const existing = await prisma.task.findUnique({ where: { id } })
    if (!existing) return errorResponse('Task not found', 404)

    const body = await request.json()
    const data = updateTaskSchema.parse(body)

    // Team members can only update status of tasks assigned to them
    if (session!.role === Role.TEAM_MEMBER) {
      if (existing.assigneeId !== session!.userId) return errorResponse('Forbidden', 403)
      // Only allow status updates for team members
      const allowedFields = ['status']
      const hasDisallowedFields = Object.keys(data).some(k => !allowedFields.includes(k))
      if (hasDisallowedFields) return errorResponse('You can only update task status', 403)
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline !== undefined
          ? (data.deadline ? new Date(data.deadline) : null)
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    })

    return successResponse({ task })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/tasks/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    await prisma.task.delete({ where: { id } })
    return successResponse({ message: 'Task deleted' })
  } catch (e) {
    console.error('[DELETE /api/tasks/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
