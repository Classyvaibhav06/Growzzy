import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPresignedDownloadUrl } from '@/lib/s3'
import { requireAuth } from '@/lib/api-helpers'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user || !user.avatar) return new NextResponse('Not found', { status: 404 })

    // Extract the S3 key from the full URL
    // Format: https://bucket.s3.region.amazonaws.com/key
    const urlParts = user.avatar.split('.amazonaws.com/')
    
    // If it's not a standard S3 URL (maybe an external link), just redirect to it
    if (urlParts.length !== 2) {
      return NextResponse.redirect(user.avatar)
    }

    const key = urlParts[1]
    
    // Generate a presigned URL valid for 1 hour
    const presignedUrl = await getPresignedDownloadUrl(key, 3600)
    
    return NextResponse.redirect(presignedUrl)
  } catch (e) {
    console.error('[GET /api/users/[id]/avatar/proxy]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
