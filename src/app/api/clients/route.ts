import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createClientSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          projects: { select: { id: true, name: true, status: true } },
          _count: { select: { contracts: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return successResponse({ clients, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
  } catch (e) {
    console.error('[GET /api/clients]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = createClientSchema.parse(body)

    const client = await prisma.client.create({ data })
    return successResponse({ client }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/clients]', e)
    return errorResponse('Internal server error', 500)
  }
}
