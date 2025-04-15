import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-middleware';
import bcrypt from 'bcryptjs';

export const GET = withAdminAuth(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true
    }
  });
  
  return NextResponse.json(users);
});

export const POST = withAdminAuth(async (request: Request) => {
  const { name, email, password, role = 'USER' } = await request.json();
  
  // 验证必填字段
  if (!email || !password) {
    return NextResponse.json({ error: '邮箱和密码为必填项' }, { status: 400 });
  }
  
  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
  }
  
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  
  return NextResponse.json(user);
});

export const PUT = withAdminAuth(async (request: Request) => {
  const { id, name, email, role, password } = await request.json();
  
  if (!id) {
    return NextResponse.json({ error: '用户ID为必填项' }, { status: 400 });
  }
  
  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  
  // 如果提供了新密码，就更新密码
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });
  
  return NextResponse.json(user);
});

export const DELETE = withAdminAuth(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID参数必须提供' }, { status: 400 });
  }
  
  const user = await prisma.user.delete({
    where: { id }
  });
  
  return NextResponse.json({ message: '用户已删除', id });
});
