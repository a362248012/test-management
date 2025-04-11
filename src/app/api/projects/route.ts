import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProjectType } from '@prisma/client'

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$connect()
    console.log('Database connection successful')
    
    console.log('Attempting to fetch projects...')
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Successfully fetched projects:', projects)
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, description } = await request.json()
    
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        type: type as ProjectType,
        description
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
