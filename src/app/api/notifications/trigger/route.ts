import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const now = new Date()
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Find all users to notify
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    })

    const adminIds = admins.map(a => a.id)

    // ── Contract Expiry Alerts ──────────────────────────
    const expiringContracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: thirtyDaysFromNow },
      },
      include: { client: { select: { name: true } } },
    })

    for (const contract of expiringContracts) {
      for (const adminId of adminIds) {
        const exists = await prisma.notification.findFirst({
          where: {
            userId: adminId,
            type: 'CONTRACT_EXPIRING',
            metadata: { contains: contract.id },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // not in last 24h
          },
        })
        if (!exists) {
          await prisma.notification.create({
            data: {
              userId: adminId,
              type: 'CONTRACT_EXPIRING',
              title: 'Contract Expiring Soon',
              message: `Contract "${contract.title}" with ${contract.client.name} expires on ${contract.endDate?.toLocaleDateString()}.`,
              metadata: JSON.stringify({ contractId: contract.id }),
            },
          })
        }
      }
    }

    // ── Overdue Invoice Alerts ──────────────────────────
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      include: { client: { select: { name: true } } },
    })

    // Auto-mark as overdue
    if (overdueInvoices.length > 0) {
      await prisma.invoice.updateMany({
        where: { id: { in: overdueInvoices.map(i => i.id) } },
        data: { status: 'OVERDUE' },
      })
    }

    for (const invoice of overdueInvoices) {
      for (const adminId of adminIds) {
        const exists = await prisma.notification.findFirst({
          where: {
            userId: adminId,
            type: 'INVOICE_OVERDUE',
            metadata: { contains: invoice.id },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        })
        if (!exists) {
          await prisma.notification.create({
            data: {
              userId: adminId,
              type: 'INVOICE_OVERDUE',
              title: 'Invoice Overdue',
              message: `Invoice #${invoice.number} for ${invoice.client.name} (${invoice.amount}) is overdue.`,
              metadata: JSON.stringify({ invoiceId: invoice.id }),
            },
          })
        }
      }
    }

    // ── Deadline Approaching (24h) ────────────────────
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const urgentTasks = await prisma.task.findMany({
      where: {
        deadline: { gte: now, lte: tomorrow },
        status: { not: 'COMPLETED' },
        assigneeId: { not: null },
      },
    })

    for (const task of urgentTasks) {
      if (!task.assigneeId) continue
      const exists = await prisma.notification.findFirst({
        where: {
          userId: task.assigneeId,
          type: 'DEADLINE_APPROACHING',
          metadata: { contains: task.id },
          createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        },
      })
      if (!exists) {
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            type: 'DEADLINE_APPROACHING',
            title: 'Task Deadline Approaching',
            message: `"${task.title}" is due within 24 hours.`,
            metadata: JSON.stringify({ taskId: task.id }),
          },
        })
      }
    }

    return successResponse({
      processed: {
        expiringContracts: expiringContracts.length,
        overdueInvoices: overdueInvoices.length,
        urgentTasks: urgentTasks.length,
      },
    })
  } catch (e) {
    console.error('[POST /api/notifications/trigger]', e)
    return errorResponse('Internal server error', 500)
  }
}
