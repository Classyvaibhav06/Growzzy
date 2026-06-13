import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { createInvoiceSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = {
      ...(clientId && { clientId }),
      ...(status && { status }),
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ invoices })
  } catch (e) {
    console.error('[GET /api/invoices]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    // Only managers and admins should create invoices usually, but let's allow based on team structure if needed.
    if (session!.role === Role.TEAM_MEMBER) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const data = createInvoiceSchema.parse(body)

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return successResponse({ invoice }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/invoices]', e)
    return errorResponse('Internal server error', 500)
  }
}
