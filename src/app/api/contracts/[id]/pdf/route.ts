import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, errorResponse } from '@/lib/api-helpers'
import { getPresignedDownloadUrl } from '@/lib/s3'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) return errorResponse('Contract not found', 404)
    if (!contract.s3Key) return errorResponse('No PDF file associated with this contract', 404)

    // Get a fresh presigned URL valid for 5 minutes
    const url = await getPresignedDownloadUrl(contract.s3Key, 300)
    
    // Redirect the user to the presigned URL
    return NextResponse.redirect(url)
  } catch (e) {
    console.error('[GET /api/contracts/[id]/pdf]', e)
    return errorResponse('Internal server error', 500)
  }
}
