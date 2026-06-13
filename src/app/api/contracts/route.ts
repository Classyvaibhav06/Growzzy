import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createContractSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Check for contracts expiring in 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const contracts = await prisma.contract.findMany({
      where,
      include: { client: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Annotate expiring soon
    const annotated = contracts.map(c => ({
      ...c,
      expiringSoon: c.endDate ? c.endDate <= thirtyDaysFromNow && c.endDate > new Date() : false,
    }))

    return successResponse({ contracts: annotated })
  } catch (e) {
    console.error('[GET /api/contracts]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = createContractSchema.parse(body)

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: data.clientId } })
    if (!client) return errorResponse('Client not found', 404)

    const contract = await prisma.contract.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return successResponse({ contract }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/contracts]', e)
    return errorResponse('Internal server error', 500)
  }
}
