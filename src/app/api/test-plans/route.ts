import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withErrorHandler } from '@/lib/api-middleware';
import type { Session } from 'next-auth';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  // 构建查询条件
  const where: any = {};
  if (projectId) where.projectId = projectId;

  // 执行查询，添加分页
  const [testPlans, total] = await Promise.all([
    prisma.testPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.testPlan.count({ where })
  ]);

  return NextResponse.json({
    data: testPlans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const POST = withAuth(async (request: Request, _, session: Session) => {
  const body = await request.json();
  
  // 验证必填字段
  if (!body.name || !body.status) {
    return NextResponse.json(
      { error: "名称和状态为必填项" },
      { status: 400 }
    );
  }

  // 创建测试计划
  const newPlan = await prisma.testPlan.create({
    data: {
      name: body.name,
      description: body.description || null,
      content: body.content || null,
      implementation: body.implementation || null,
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isAIGenerated: body.isAIGenerated || false,
      projectId: body.projectId || null,
      createdBy: {
        connect: { id: session.user.id }
      }
    }
  });

  return NextResponse.json(newPlan);
});
