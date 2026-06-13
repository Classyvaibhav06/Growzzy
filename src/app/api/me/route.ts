import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    let user = await prisma.user.findUnique({
      where: { id: session!.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    })

    if (!user) return errorResponse('User not found', 404)

    // Enforce that ONLY admin@growwzzy.com can be ADMIN. 
    // If any other user has the ADMIN role, securely downgrade them to MANAGER.
    if (user.role === 'ADMIN' && user.email !== 'admin@growwzzy.com') {
      user = await prisma.user.update({
        where: { id: session!.userId },
        data: { role: 'MANAGER' },
        select: { id: true, name: true, email: true, role: true, avatar: true }
      })
    }

    return successResponse({ user })
  } catch (e) {
    console.error('[GET /api/me]', e)
    return errorResponse('Internal server error', 500)
  }
}
