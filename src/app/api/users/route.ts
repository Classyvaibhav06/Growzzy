import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { assignedTasks: true, checkIns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ users })
  } catch (e) {
    console.error('[GET /api/users]', e)
    return errorResponse('Internal server error', 500)
  }
}

import * as bcrypt from 'bcrypt'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Only Admins can create new users directly from the dashboard
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role || 'TEAM_MEMBER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return successResponse({ user }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/users]', e)
    return errorResponse('Internal server error', 500)
  }
}
