import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const isTeamMember = session!.role === Role.TEAM_MEMBER
    const userId = session!.userId

    // 1. Stats
    let totalClients = 0
    let activeProjects = 0
    let pendingTasks = 0
    let recentCheckIns = 0

    if (!isTeamMember) {
      totalClients = await prisma.client.count()
      activeProjects = await prisma.project.count({ where: { status: 'ACTIVE' } })
      pendingTasks = await prisma.task.count({ where: { status: { not: 'COMPLETED' } } })
      
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      recentCheckIns = await prisma.checkIn.count({ where: { date: { gte: sevenDaysAgo } } })
    } else {
      // Team Member stats
      pendingTasks = await prisma.task.count({ 
        where: { assigneeId: userId, status: { not: 'COMPLETED' } } 
      })
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      recentCheckIns = await prisma.checkIn.count({ 
        where: { userId: userId, date: { gte: sevenDaysAgo } } 
      })
    }

    // 2. Revenue Data (Last 30 Days) - Admin/Manager only
    let revenueData: any[] = []
    if (!isTeamMember) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
      thirtyDaysAgo.setHours(0, 0, 0, 0)

      const incomes = await prisma.income.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        select: { amount: true, date: true }
      })

      const expenses = await prisma.expense.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        select: { amount: true, date: true }
      })

      // Aggregate by day
      const dailyData: Record<string, { name: string; income: number; expense: number }> = {}
      
      // Initialize last 30 days with 0
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayLabel = d.toLocaleString('default', { month: 'short', day: 'numeric' })
        dailyData[dayLabel] = { name: dayLabel, income: 0, expense: 0 }
      }

      incomes.forEach(inc => {
        const dayLabel = inc.date.toLocaleString('default', { month: 'short', day: 'numeric' })
        if (dailyData[dayLabel]) {
          dailyData[dayLabel].income += inc.amount
        }
      })

      expenses.forEach(exp => {
        const dayLabel = exp.date.toLocaleString('default', { month: 'short', day: 'numeric' })
        if (dailyData[dayLabel]) {
          dailyData[dayLabel].expense += exp.amount
        }
      })

      revenueData = Object.values(dailyData)
    }

    // 3. Recent Activity (Blended list of CheckIns and Tasks)
    const recentTasks = await prisma.task.findMany({
      where: isTeamMember ? { OR: [{ assigneeId: userId }, { createdById: userId }] } : {},
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        assignee: { select: { name: true, avatar: true } },
        createdBy: { select: { name: true, avatar: true } }
      }
    })

    const recentChecks = await prisma.checkIn.findMany({
      where: isTeamMember ? { userId: userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, avatar: true } }
      }
    })

    // Blend and sort
    const blendedActivity = [
      ...recentTasks.map(t => ({
        id: `task-${t.id}`,
        type: 'TASK',
        user: t.assignee || t.createdBy,
        message: `updated task "${t.title}"`,
        date: t.updatedAt
      })),
      ...recentChecks.map(c => ({
        id: `checkin-${c.id}`,
        type: 'CHECKIN',
        user: c.user,
        message: `submitted a check-in`,
        date: c.createdAt
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

    return successResponse({
      stats: {
        totalClients,
        activeProjects,
        pendingTasks,
        recentCheckIns
      },
      revenueData,
      recentActivity: blendedActivity
    })

  } catch (e) {
    console.error('[GET /api/dashboard/overview]', e)
    return errorResponse('Internal server error', 500)
  }
}
