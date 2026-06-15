import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error || !session) {
      return errorResponse(error || 'Unauthorized', 401)
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to 20 most recent
    })

    return successResponse({ notifications })
  } catch (err: any) {
    console.error("GET /api/notifications error:", err)
    return errorResponse(err.message || 'Internal server error', 500)
  }
}
