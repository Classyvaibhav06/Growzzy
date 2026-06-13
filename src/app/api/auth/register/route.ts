import { NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api-helpers'
import { registerSchema } from '@/lib/validations'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const { session, error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: (data.role as Role) ?? Role.TEAM_MEMBER,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', fields: e.errors },
        { status: 422 }
      )
    }
    console.error('[POST /api/auth/register]', e)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
