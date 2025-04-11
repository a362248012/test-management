import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testPlan = await prisma.testPlan.findUnique({
      where: { id: params.id },
    });

    if (!testPlan) {
      return NextResponse.json(
        { error: "测试计划不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(testPlan);
  } catch (error) {
    return NextResponse.json(
      { error: "获取测试计划失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.status) {
      return NextResponse.json(
        { error: "名称和状态为必填项" },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("更新测试计划错误:", error);
    return NextResponse.json(
      { 
        error: "更新测试计划失败",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
