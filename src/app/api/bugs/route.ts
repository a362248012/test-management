import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')
    const testCaseId = searchParams.get('testCaseId')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    if (ticketId) where.ticketId = ticketId
    if (testCaseId) where.testCaseId = testCaseId
    if (projectId) where.projectId = projectId

    const bugs = await prisma.bug.findMany({
      where,
      include: {
        ticket: true,
        testCase: true,
        project: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bugs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bugs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, ticketId, testCaseId, projectId } = body

    if (!title || !ticketId || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Creating bug with data:', {
      title,
      description,
      priority,
      ticketId,
      testCaseId,
      projectId,
      createdById: session.user.id
    })

    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        priority,
        ticketId: ticketId || null,
        testCaseId: testCaseId || null,
        projectId,
        createdById: session.user.id
      }
    })

    console.log('Bug created successfully:', bug)
    return NextResponse.json(bug)
  } catch (error) {
    console.error('Error creating bug:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create bug', details: errorMessage },
      { status: 500 }
    )
  }
}
