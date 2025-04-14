import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withErrorHandler } from '@/lib/api-middleware';
import type { Session } from 'next-auth';

export const GET = withErrorHandler(async (
  _: Request,
  { params }: { params: { id: string } }
) => {
  const testPlan = await prisma.testPlan.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  if (!testPlan) {
    return NextResponse.json(
      { error: "测试计划不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json(testPlan);
});

export const PUT = withAuth(async (
  request: Request,
  { params }: { params: { id: string } },
  session: Session
) => {
  const body = await request.json();
  
  // 验证必填字段
  if (!body.name || !body.status) {
    return NextResponse.json(
      { error: "名称和状态为必填项" },
      { status: 400 }
    );
  }

  // 先检查是否为该计划的创建者
  const existingPlan = await prisma.testPlan.findUnique({
    where: { id: params.id },
    select: { createdById: true }
  });

  if (!existingPlan) {
    return NextResponse.json({ error: "测试计划不存在" }, { status: 404 });
  }

  // 只允许创建者或管理员编辑
  if (existingPlan.createdById !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "无权限编辑此测试计划" }, { status: 403 });
  }

  // 转换日期格式
  const data = {
    name: body.name,
    description: body.description || null,
    content: body.content || null,
    implementation: body.implementation || null,
    status: body.status,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
    isAIGenerated: body.isAIGenerated || false,
  };

  const updatedPlan = await prisma.testPlan.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updatedPlan);
});
