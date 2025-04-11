import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const testPlans = await prisma.testPlan.findMany({
      where: {
        ...(projectId && { projectId })
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(testPlans);
  } catch (error) {
    return NextResponse.json(
      { error: "获取测试计划列表失败" },
      { status: 500 }
    );
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

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
        createdBy: {
          connect: { id: session.user.id }
        },
        ...(body.projectId && {
          project: {
            connect: { id: body.projectId }
          }
        })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("创建测试计划错误:", error);
    return NextResponse.json(
      { 
        error: "创建测试计划失败",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
