import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const [
      totalClients,
      activeProjects,
      pendingTasks,
      recentCheckIns,
      recentInvoices,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count({ where: { status: { not: 'COMPLETED' } } }),
      prisma.checkIn.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { id: true, name: true } } },
      }),
      prisma.task.findMany({
        where: {
          deadline: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next 7 days
          },
          status: { not: 'COMPLETED' },
        },
        include: {
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
    ])

    return successResponse({
      stats: { totalClients, activeProjects, pendingTasks },
      recentCheckIns,
      recentInvoices,
      upcomingDeadlines,
    })
  } catch (e) {
    console.error('[GET /api/dashboard]', e)
    return errorResponse('Internal server error', 500)
  }
}
