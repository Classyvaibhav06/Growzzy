import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createTaskSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {
      ...(projectId && { projectId }),
      ...(assigneeId && { assigneeId }),
      ...(status && { status }),
      ...(priority && { priority }),
    }

    // Team members can only see tasks they're assigned to or created
    if (session!.role === Role.TEAM_MEMBER) {
      where.OR = [
        { assigneeId: session!.userId },
        { createdById: session!.userId },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatar: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    return successResponse({ tasks })
  } catch (e) {
    console.error('[GET /api/tasks]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireRole(Role.MANAGER)
    if (error) return error

    const body = await request.json()
    const data = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...data,
        createdById: session!.userId,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    })

    // Notify the assignee
    if (task.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned the task: "${task.title}"`,
          metadata: JSON.stringify({ taskId: task.id }),
        },
      })
    }

    return successResponse({ task }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/tasks]', e)
    return errorResponse('Internal server error', 500)
  }
}
