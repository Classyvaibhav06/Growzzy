import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const user = await prisma.user.findUnique({
      where: { id: session!.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    })

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, user })
  } catch (e) {
    console.error('[GET /api/auth/me]', e)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
