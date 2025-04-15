import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Priority } from '@/lib/constants';
import { withAuth, withErrorHandler } from '@/lib/api-middleware';
import type { Session } from 'next-auth';

export const GET = withErrorHandler(async (request: Request) => {
  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  
  // 构建查询条件
  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority as Priority;
  
  const testCases = await prisma.testCase.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  
  return NextResponse.json(testCases);
});

export const DELETE = withAuth(async (request: Request, _, session: Session) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID参数必须提供' }, { status: 400 });
  }
  
  const deletedTestCase = await prisma.testCase.delete({
    where: {
      id,
      createdById: session.user.id, // 确保只能删除自己创建的用例
    },
  });
  
  return NextResponse.json(deletedTestCase);
});

export const PATCH = withAuth(async (request: Request, _, session: Session) => {
  const requestData = await request.json();
  const { id, priority, ...data } = requestData;
  
  const testCase = await prisma.testCase.update({
    where: {
      id,
      createdById: session.user.id
    },
    data: {
      ...data,
      priority: priority
    }
  });

  return NextResponse.json(testCase);
});

export const POST = withAuth(async (request: Request, _, session: Session) => {
  const data = await request.json();
  
  const testCase = await prisma.testCase.create({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: session.user.id
        }
      }
    }
  });
  
  return NextResponse.json(testCase);
});
