import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'

type Params = { params: Promise<{ id: string }> }

// Mark single notification as read
export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) return errorResponse('Notification not found', 404)
    if (notification.userId !== session!.userId) return errorResponse('Forbidden', 403)

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return successResponse({ notification: updated })
  } catch (e) {
    console.error('[PATCH /api/notifications/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
