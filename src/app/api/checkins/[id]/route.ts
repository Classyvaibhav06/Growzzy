import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { reviewCheckInSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { session, error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const data = reviewCheckInSchema.parse(body)

    const checkIn = await prisma.checkIn.update({
      where: { id },
      data: {
        reviewNote: data.reviewNote,
        reviewedById: session!.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    })

    return successResponse({ checkIn })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/checkins/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
