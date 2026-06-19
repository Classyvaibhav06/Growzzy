import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { updateProspectSchema } from '@/lib/validations'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error || !session) return error ?? errorResponse('Unauthorized', 401)

    const { id } = await params
    const body = await request.json()
    const data = updateProspectSchema.parse(body)

    const prospect = await prisma.prospect.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, name: true } } },
    })

    return successResponse({ prospect })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/prospects/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error || !session) return error ?? errorResponse('Unauthorized', 401)

    const { id } = await params
    await prisma.prospect.delete({ where: { id } })

    return successResponse({ message: 'Prospect deleted' })
  } catch (e) {
    console.error('[DELETE /api/prospects/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
