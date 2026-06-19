import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { createProspectSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error || !session) return error ?? errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'All') where.status = status

    const prospects = await prisma.prospect.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ prospects, total: prospects.length })
  } catch (e) {
    console.error('[GET /api/prospects]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error || !session) return error ?? errorResponse('Unauthorized', 401)

    const body = await request.json()
    const data = createProspectSchema.parse(body)

    const prospect = await prisma.prospect.create({
      data: {
        ...data,
        ownerId: session.userId,
      },
      include: {
        owner: { select: { id: true, name: true } },
      },
    })

    return successResponse({ prospect }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/prospects]', e)
    return errorResponse('Internal server error', 500)
  }
}
