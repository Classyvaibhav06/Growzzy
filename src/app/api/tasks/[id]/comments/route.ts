import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { createCommentSchema } from '@/lib/validations'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse({ comments })
  } catch (e) {
    console.error('[GET /api/tasks/[id]/comments]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const data = createCommentSchema.parse(body)

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) return errorResponse('Task not found', 404)

    const comment = await prisma.taskComment.create({
      data: { taskId: id, userId: session!.userId, content: data.content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    return successResponse({ comment }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/tasks/[id]/comments]', e)
    return errorResponse('Internal server error', 500)
  }
}
