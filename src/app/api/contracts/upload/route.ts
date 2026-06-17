import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { uploadToS3 } from '@/lib/s3'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(Role.MANAGER)
    if (error) return error

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string
    const title = formData.get('title') as string
    const value = parseFloat(formData.get('value') as string)
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!file || !clientId || !title || isNaN(value)) {
      return errorResponse('Missing required fields', 400)
    }

    // Verify client
    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) return errorResponse('Client not found', 404)

    // Process file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const key = `contracts/uploads/${Date.now()}-${safeFilename}`

    let s3Url: string | undefined
    try {
      s3Url = await uploadToS3(buffer, key, file.type)
    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error)
      return errorResponse('Failed to upload file to S3', 500)
    }

    // Save to DB
    const contract = await prisma.contract.create({
      data: {
        clientId,
        title,
        value,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE', // Uploaded contracts are typically already active/signed
        s3Key: key,
        s3Url: s3Url,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return successResponse({ contract }, 201)
  } catch (e) {
    console.error('[POST /api/contracts/upload]', e)
    return errorResponse('Internal server error', 500)
  }
}
