import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth'
import type { Session } from 'next-auth'

export async function GET(request: Request) {
  try {
    console.log('Starting GET /api/knowledge-base')
    const session = await getServerSession(authConfig)
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    console.log('Query params:', { search, category })

    const where: any = {
      OR: [
        { isPublic: true },
        { createdById: session.user.id }
      ]
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } }
          ]
        }
      ]
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }

    console.log('Database query conditions:', where)
    
    const knowledge = await prisma.knowledgeBase.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Fetched knowledge items:', knowledge.length)
    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('Error fetching knowledge:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST /api/knowledge-base')
    const session = await getServerSession(authConfig)
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Parsing request body...')
    const body = await request.json()
    console.log('Request body:', body)
    
    if (!body.title || !body.content) {
      console.warn('Missing required fields:', {
        hasTitle: !!body.title,
        hasContent: !!body.content
      })
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      )
    }

    console.log('Creating knowledge base entry...')
    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category || 'General',
        tags: body.tags || [],
        isPublic: body.isPublic || false,
        createdById: session.user.id
      }
    })
    console.log('Successfully created knowledge:', knowledge)

    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('Error creating knowledge:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const knowledge = await prisma.knowledgeBase.update({
      where: { id, createdById: session.user.id },
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        tags: body.tags,
        isPublic: body.isPublic
      }
    })
    console.log('Updated knowledge:', knowledge) // 添加日志

    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('Error updating knowledge:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.knowledgeBase.delete({
      where: { id, createdById: session.user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
