import { NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email } })

    // Constant-time comparison to prevent timing attacks
    const dummyHash = '$2b$10$invalidhashinvalidhashinvalidhashinvalidhash'
    const passwordMatch = await bcrypt.compare(
      data.password,
      user?.passwordHash ?? dummyHash
    )

    if (!user || !passwordMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const token = await encrypt(sessionData)
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ success: true, user: sessionData })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password format.' },
        { status: 422 }
      )
    }
    console.error('[POST /api/auth/login]', e)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
