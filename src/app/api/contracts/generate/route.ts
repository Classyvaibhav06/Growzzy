import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { generateContractSchema } from '@/lib/validations'
import { generateContractPDF } from '@/lib/pdf/generator'
import { uploadToS3 } from '@/lib/s3'
import { Role } from '@prisma/client'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const body = await request.json()
    const data = generateContractSchema.parse(body)

    // Generate PDF buffer
    const pdfBuffer = await generateContractPDF({
      clientName: data.clientName,
      contractText: data.contractText,
      price: data.price,
      startDate: data.startDate,
      endDate: data.endDate,
    })

    // Upload to S3
    const key = `contracts/generated/${Date.now()}-${data.clientName.replace(/\s+/g, '-')}.pdf`
    let s3Url: string | undefined

    try {
      s3Url = await uploadToS3(pdfBuffer, key, 'application/pdf')
    } catch (s3Error) {
      console.warn('S3 upload failed, continuing without S3:', s3Error)
    }

    // Save contract record to DB
    const contract = await prisma.contract.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        value: data.price,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'DRAFT',
        s3Key: s3Url ? key : null,
        s3Url: s3Url ?? null,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    // Return PDF inline if S3 is not available
    if (!s3Url) {
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="contract-${data.clientName}.pdf"`,
        },
      })
    }

    return successResponse({ contract, downloadUrl: s3Url }, 201)
  } catch (e) {
    if (e instanceof ZodError) return errorResponse('Validation failed', 422, { fields: e.errors })
    console.error('[POST /api/contracts/generate]', e)
    return errorResponse('Internal server error', 500)
  }
}
