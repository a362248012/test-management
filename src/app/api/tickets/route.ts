import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authConfig as authOptions } from '@/auth'

// 检查数据库连接
async function checkDBConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('数据库连接失败:', error)
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        relatedTestCase: true,
        relatedTestPlan: true
      }
    })
    return NextResponse.json(ticket)
  }

  const projectId = searchParams.get('projectId')
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(projectId && { projectId })
    },
    include: {
      createdBy: true,
      assignedTo: true,
      relatedTestCase: true,
      relatedTestPlan: true
    }
  })
  return NextResponse.json(tickets)
}

export async function PUT(request: Request) {
  // 检查数据库连接
  const isDBConnected = await checkDBConnection()
  if (!isDBConnected) {
    return NextResponse.json(
      { error: '数据库连接失败', details: '无法连接到数据库服务' },
      { status: 500 }
    )
  }

  try {
    const data = await request.json()
    
    // 验证必要字段
    if (!data.id) {
      return NextResponse.json(
        { error: '工单ID不能为空' },
        { status: 400 }
      )
    }

    // 验证priority值是否有效
    const validPriorities = ['P0', 'P1', 'P2', 'P3'];
    const priority = validPriorities.includes(data.priority) ? data.priority : 'P2';

    // 验证status值是否有效
    const validStatuses = ['PENDING', 'SCHEDULED', 'DEVELOPING', 'PAUSED', 'LIVE'];
    const status = validStatuses.includes(data.status) ? data.status : 'PENDING';

    const ticket = await prisma.ticket.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        status: status,
        priority: priority,
        assignedToId: data.assignedToId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('更新工单失败:', error)
    return NextResponse.json(
      { 
        error: '更新工单失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // 检查数据库连接
  const isDBConnected = await checkDBConnection()
  if (!isDBConnected) {
    return NextResponse.json(
      { error: '数据库连接失败', details: '无法连接到数据库服务' },
      { status: 500 }
    )
  }

  try {
    const data = await request.json()
    
    // 验证必要字段
    if (!data.title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    // 获取当前用户ID并验证用户存在
    let createdById = data.createdById;
    if (!createdById) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: '创建工单失败', details: '用户未登录' },
          { status: 401 }
        );
      }
      createdById = session.user.id;
    }

    // 验证用户ID是否存在
    const userExists = await prisma.user.findUnique({
      where: { id: createdById },
      select: { id: true }
    });
    if (!userExists) {
      return NextResponse.json(
        { 
          error: '创建工单失败', 
          details: `用户ID ${createdById} 不存在` 
        },
        { status: 400 }
      );
    }

    // 验证priority值是否有效
    const validPriorities = ['P0', 'P1', 'P2', 'P3'];
    const priority = validPriorities.includes(data.priority) ? data.priority : 'P2';

    // 验证status值是否有效
    const validStatuses = ['PENDING', 'SCHEDULED', 'DEVELOPING', 'PAUSED', 'LIVE'];
    const status = validStatuses.includes(data.status) ? data.status : 'PENDING';

    // 获取默认项目ID
    let projectId = data.projectId;
    if (!projectId) {
      const defaultProject = await prisma.project.findFirst({ 
        where: { type: 'HINA' } 
      });
      projectId = defaultProject?.id;
    }

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空' },
        { status: 400 }
      )
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: status,
        priority: priority,
        createdById: createdById,
        assignedToId: data.assignedToId || null,
        projectId: projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('创建工单失败:', error)
    return NextResponse.json(
      { 
        error: '创建工单失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
