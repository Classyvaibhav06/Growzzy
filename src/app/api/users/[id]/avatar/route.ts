import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return errorResponse('No file provided', 400)

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File too large (max 5MB)', 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()
    const key = `avatars/${id}-${Date.now()}.${ext}`

    const s3Url = await uploadToS3(buffer, key, file.type)

    const user = await prisma.user.update({
      where: { id },
      data: { avatar: s3Url },
      select: { id: true, name: true, avatar: true }
    })

    return successResponse({ user })
  } catch (e) {
    console.error('[POST /api/users/[id]/avatar]', e)
    return errorResponse('Internal server error', 500)
  }
}
