import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helpers'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true
      }
    })

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 })
    }

    // Create a new PDF Document
    const doc = new PDFDocument({ margin: 50 })
    
    // We will use a TransformStream to convert Node.js stream to Web stream
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    doc.on('data', (chunk) => {
      writer.write(chunk)
    })

    doc.on('end', () => {
      writer.close()
    })

    doc.on('error', (err) => {
      console.error(err)
      writer.abort(err)
    })

    // Build the PDF content
    doc.fontSize(25).font('Helvetica-Bold').text('INVOICE', { align: 'right' })
    doc.moveDown()
    
    doc.fontSize(12).font('Helvetica-Bold').text('Growwzzy Agency')
    doc.font('Helvetica').text('123 Marketing St, Suite 100')
    doc.text('support@growwzzy.com')
    doc.moveDown(2)

    doc.font('Helvetica-Bold').text('Bill To:')
    doc.font('Helvetica').text(invoice.client.name)
    if (invoice.client.email) {
      doc.text(invoice.client.email)
    }
    if (invoice.client.address) {
      doc.text(invoice.client.address)
    }
    doc.moveDown()

    doc.font('Helvetica-Bold').text('Invoice Details:')
    doc.font('Helvetica').text(`Invoice Number: ${invoice.number}`)
    doc.text(`Status: ${invoice.status}`)
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`)
    doc.moveDown(2)

    // A simple table-like layout
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)
    doc.font('Helvetica-Bold')
    doc.text('Description', 50, doc.y, { continued: true })
    doc.text('Amount', 0, doc.y, { align: 'right' })
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)

    doc.font('Helvetica')
    doc.text('Digital Marketing Services', 50, doc.y, { continued: true })
    doc.text(`$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 0, doc.y, { align: 'right' })
    doc.moveDown(2)

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(0.5)
    
    doc.font('Helvetica-Bold').fontSize(14)
    doc.text('Total Due:', 50, doc.y, { continued: true })
    doc.text(`$${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 0, doc.y, { align: 'right' })

    // Finalize PDF
    doc.end()

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
      }
    })
  } catch (e) {
    console.error('[GET /api/invoices/[id]/download]', e)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
