import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true
    }
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, password } = await request.json()
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password
    }
  })
  return NextResponse.json(user)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...data } = await request.json()
  const user = await prisma.user.update({
    where: { id },
    data
  })
  return NextResponse.json(user)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  
  // 验证1：不能删除自己
  if (id === session.user.id) {
    return NextResponse.json({ error: '不能删除自己的账户' }, { status: 400 })
  }

  // 验证2：获取要删除的用户信息
  const userToDelete = await prisma.user.findUnique({
    where: { id },
    select: { role: true }
  })

  if (!userToDelete) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  // 验证3：检查当前用户是否是管理员
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (currentUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: '无删除权限' }, { status: 403 })
  }

  // 验证4：不能删除其他管理员（可选）
  if (userToDelete.role === 'ADMIN') {
    return NextResponse.json({ error: '不能删除其他管理员' }, { status: 403 })
  }

  await prisma.user.delete({
    where: { id }
  })
  return NextResponse.json({ success: true })
}
