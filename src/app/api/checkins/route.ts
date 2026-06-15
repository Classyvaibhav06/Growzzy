import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { createCheckInSchema, reviewCheckInSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    // Team members only see their own check-ins
    if (session!.role === Role.TEAM_MEMBER) {
      where.userId = session!.userId
    } else if (userId) {
      where.userId = userId
    }

    if (startDate) where.date = { ...where.date, gte: new Date(startDate) }
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

    const checkIns = await prisma.checkIn.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    })

    return successResponse({ checkIns })
  } catch (e) {
    console.error('[GET /api/checkins]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const data = createCheckInSchema.parse(body)

    // Check if user already submitted today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.checkIn.findFirst({
      where: {
        userId: session!.userId,
        date: { gte: today, lt: tomorrow },
      },
    })

    if (existing) {
      return errorResponse('You have already submitted a check-in for today', 409)
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session!.userId,
        yesterday: data.yesterday,
        today: data.today,
        blockers: data.blockers,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Notify admins and managers
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } },
      select: { id: true }
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'SYSTEM',
          title: 'New Team Check-in',
          message: `${checkIn.user.name} has submitted their daily check-in.`,
        }))
      })
    }

    return successResponse({ checkIn }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/checkins]', e)
    return errorResponse('Internal server error', 500)
  }
}
