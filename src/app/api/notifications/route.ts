import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const notifications = await prisma.notification.findMany({
      where: { userId: session!.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: session!.userId, isRead: false },
    })

    return successResponse({ notifications, unreadCount })
  } catch (e) {
    console.error('[GET /api/notifications]', e)
    return errorResponse('Internal server error', 500)
  }
}

// Mark all as read
export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    await prisma.notification.updateMany({
      where: { userId: session!.userId, isRead: false },
      data: { isRead: true },
    })

    return successResponse({ message: 'All notifications marked as read' })
  } catch (e) {
    console.error('[PATCH /api/notifications]', e)
    return errorResponse('Internal server error', 500)
  }
}
