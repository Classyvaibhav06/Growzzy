import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { updateClientSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: { tasks: { select: { id: true, title: true, status: true, priority: true } } },
        },
        contracts: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!client) return errorResponse('Client not found', 404)
    return successResponse({ client })
  } catch (e) {
    console.error('[GET /api/clients/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    const body = await _req.json()
    const data = updateClientSchema.parse(body)

    const client = await prisma.client.update({ where: { id }, data })
    return successResponse({ client })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/clients/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    await prisma.client.delete({ where: { id } })
    return successResponse({ message: 'Client deleted' })
  } catch (e) {
    console.error('[DELETE /api/clients/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
