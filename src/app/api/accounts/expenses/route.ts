import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createExpenseSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
    return successResponse({ expenses })
  } catch (e) {
    console.error('[GET /api/accounts/expenses]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = createExpenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    })

    return successResponse({ expense }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/accounts/expenses]', e)
    return errorResponse('Internal server error', 500)
  }
}
