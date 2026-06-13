import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { getSession } from '@/lib/auth'
import { hasRole } from '@/lib/rbac'
import { Role } from '@prisma/client'

// ─── Standard API Response Helpers ───────────────────────────────────────────
export function successResponse(data: object, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function errorResponse(message: string, status = 400, details?: object) {
  return NextResponse.json(
    { success: false, error: message, ...(details && { details }) },
    { status }
  )
}

// ─── Validation Helper ────────────────────────────────────────────────────────
export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T | null> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (e) {
    return null
  }
}

export function validationError(error: ZodError) {
  return errorResponse('Validation failed', 422, {
    fields: error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    })),
  })
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
export async function requireAuth() {
  const session = await getSession()
  if (!session) return { session: null, error: errorResponse('Authentication required', 401) }
  return { session, error: null }
}

export async function requireRole(minRole: Role) {
  const { session, error } = await requireAuth()
  if (error || !session) return { session: null, error: error ?? errorResponse('Unauthorized', 401) }
  
  // Always fetch real role from DB to prevent stale JWT issues
  const { prisma } = await import('@/lib/prisma')
  const realUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!realUser) return { session: null, error: errorResponse('User not found', 404) }

  if (!hasRole(realUser.role as Role, minRole)) {
    return { session: null, error: errorResponse('Insufficient permissions', 403) }
  }
  return { session: { ...session, role: realUser.role }, error: null }
}
