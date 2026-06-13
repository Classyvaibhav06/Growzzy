import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createIncomeSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const incomes = await prisma.income.findMany({
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
      orderBy: { date: 'desc' },
    })

    return successResponse({ incomes })
  } catch (e) {
    console.error('[GET /api/accounts/income]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = createIncomeSchema.parse(body)

    const income = await prisma.income.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    })

    return successResponse({ income }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/accounts/income]', e)
    return errorResponse('Internal server error', 500)
  }
}
