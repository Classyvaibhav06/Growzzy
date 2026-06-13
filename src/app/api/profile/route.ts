import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { z, ZodError } from 'zod'
import * as bcrypt from 'bcrypt'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/).regex(/[0-9]/).optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false
  }
  return true
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"]
})

export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const data = profileSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: session!.userId } })
    if (!user) return errorResponse('User not found', 404)

    // Check if email is being changed and is already taken
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing) {
        return errorResponse('Email is already in use by another account', 400)
      }
    }

    // Handle password change
    let newPasswordHash = undefined
    if (data.newPassword && data.currentPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!isValid) {
        return errorResponse('Incorrect current password', 400, { fields: [{ path: 'currentPassword', message: 'Incorrect current password' }] })
      }
      newPasswordHash = await bcrypt.hash(data.newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(newPasswordHash && { passwordHash: newPasswordHash })
      },
      select: { id: true, name: true, email: true, role: true }
    })

    return successResponse({ user: updatedUser })
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[PATCH /api/profile]', e)
    return errorResponse('Internal server error', 500)
  }
}
