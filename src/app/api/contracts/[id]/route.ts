import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { updateContractSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!contract) return errorResponse('Contract not found', 404)
    return successResponse({ contract })
  } catch (e) {
    console.error('[GET /api/contracts/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const data = updateContractSchema.parse(body)

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return successResponse({ contract })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/contracts/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    await prisma.contract.delete({ where: { id } })
    return successResponse({ message: 'Contract deleted' })
  } catch (e) {
    console.error('[DELETE /api/contracts/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
