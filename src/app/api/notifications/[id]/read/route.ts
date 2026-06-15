import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(request)
    if (error || !session) {
      return errorResponse(error || 'Unauthorized', 401)
    }

    // Await params as per Next.js 15
    const { id } = await context.params

    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification || notification.userId !== session.userId) {
      return errorResponse('Notification not found', 404)
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return successResponse({ notification: updated })
  } catch (err: any) {
    console.error("PATCH /api/notifications/[id]/read error:", err)
    return errorResponse(err.message || 'Internal server error', 500)
  }
}
