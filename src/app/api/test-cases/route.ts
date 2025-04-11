import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Priority } from '@/lib/constants'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth'
import type { Session } from 'next-auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const testCases = await prisma.testCase.findMany({
      where: {
        createdById: session.user.id,
        ...(projectId && { projectId })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(testCases)
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()
    
    await prisma.testCase.delete({
      where: {
        id,
        createdById: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting test case:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestData = await request.json()
    const { id, priority, ...data } = requestData
    
    const testCase = await prisma.testCase.update({
      where: {
        id,
        createdById: session.user.id
      },
      data: {
        ...data,
        priority: priority
      }
    })

    return NextResponse.json(testCase)
  } catch (error) {
    const requestBody = await request.json().catch(() => 'Failed to parse request body')
    console.error('Error updating test case:', {
      error,
      requestBody
    })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error),
        requestData: requestBody
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    if (!session.user?.id) {
      throw new Error("用户会话无效，缺少用户ID")
    }

    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        steps: data.steps,
        expected: data.expected,
        isAIGenerated: data.isAIGenerated || false,
        projectId: data.projectId,
        createdById: session.user.id,
        aiPrompt: data.aiPrompt || null,
        aiHistory: data.aiHistory || [],
        relatedTickets: data.relatedTickets ? {
          connect: data.relatedTickets.connect
        } : undefined
      }
    })

    return NextResponse.json(testCase)
  } catch (error) {
    const requestBody = await request.json().catch(() => 'Failed to parse request body')
    console.error('Error creating test case:', {
      error,
      requestBody
    })
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error),
        requestData: requestBody
      },
      { status: 500 }
    )
  }
}
