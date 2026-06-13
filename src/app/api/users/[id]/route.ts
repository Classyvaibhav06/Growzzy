import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const { name, email, role, password } = body

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) return errorResponse('User not found', 404)

    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) return errorResponse('Email already in use', 400)
    }

    const dataToUpdate: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
    }

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return successResponse({ user })
  } catch (e) {
    console.error('[PATCH /api/users/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    
    // Prevent deleting the last admin, or the user deleting themselves
    const { session } = await requireRole(Role.ADMIN)
    if (session?.userId === id) {
      return errorResponse('You cannot delete your own account', 400)
    }

    await prisma.user.delete({ where: { id } })
    return successResponse({ message: 'User deleted successfully' })
  } catch (e) {
    console.error('[DELETE /api/users/[id]]', e)
    return errorResponse('Internal server error', 500)
  }
}
