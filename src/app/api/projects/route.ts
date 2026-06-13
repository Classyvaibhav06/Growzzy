import { NextResponse } from 'next/server'
import { PrismaClient, Role } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { hasRole } from '@/lib/rbac'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const projects = await prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || !hasRole(session.role, Role.MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { clientId, name, description, startDate, endDate } = await request.json()
    if (!clientId || !name) return NextResponse.json({ error: 'Client and Name are required' }, { status: 400 })

    const project = await prisma.project.create({
      data: { 
        clientId, 
        name, 
        description, 
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null 
      }
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
