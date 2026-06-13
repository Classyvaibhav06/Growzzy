import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { updateInvoiceSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    })

    if (!invoice) return errorResponse('Invoice not found', 404)

    return successResponse({ invoice })
  } catch (e) {
    console.error('[GET /api/invoices/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    // Only managers/admins can update invoices
    if (session!.role === Role.TEAM_MEMBER) {
      return errorResponse('Forbidden', 403)
    }

    const { id } = await params
    const existing = await prisma.invoice.findUnique({ where: { id } })
    if (!existing) return errorResponse('Invoice not found', 404)

    const body = await request.json()
    const data = updateInvoiceSchema.parse(body)

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    return successResponse({ invoice })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/invoices/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const { id } = await params
    await prisma.invoice.delete({ where: { id } })
    return successResponse({ message: 'Invoice deleted' })
  } catch (e) {
    console.error('[DELETE /api/invoices/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
