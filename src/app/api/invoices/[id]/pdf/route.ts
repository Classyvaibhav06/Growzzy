import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, errorResponse } from '@/lib/api-helpers'
import { generateInvoicePDF } from '@/lib/pdf/generator'
import { uploadToS3, getPresignedDownloadUrl } from '@/lib/s3'
import { Role } from '@prisma/client'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!invoice) return errorResponse('Invoice not found', 404)

    // If already uploaded to S3, return a fresh presigned URL
    if (invoice.s3Key) {
      const url = await getPresignedDownloadUrl(invoice.s3Key, 300)
      return NextResponse.json({ success: true, url })
    }

    // Otherwise generate on the fly and return inline
    const pdfBuffer = await generateInvoicePDF({
      number: invoice.number,
      client: invoice.client,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
    })

    // Attempt S3 upload silently
    try {
      const key = `invoices/${invoice.number}.pdf`
      await uploadToS3(pdfBuffer, key, 'application/pdf')
      await prisma.invoice.update({ where: { id }, data: { s3Key: key } })
    } catch {}

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    })
  } catch (e) {
    console.error('[GET /api/invoices/[id]/pdf]', e)
    return errorResponse('Internal server error', 500)
  }
}
