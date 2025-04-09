import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 确保有测试用户
    const user = await prisma.user.upsert({
      where: { email: "tester@example.com" },
      update: {},
      create: {
        email: "tester@example.com",
        name: "测试用户",
        password: "test123",
      },
    });

    // 创建测试计划
    const testPlan = await prisma.testPlan.create({
      data: {
        name: "示例测试计划",
        description: "用于演示的测试计划",
        createdById: user.id,
      },
    });

    // 创建测试用例
    const testCase = await prisma.testCase.create({
      data: {
        title: "示例测试用例",
        description: "用于演示的测试用例",
        steps: "1. 打开应用\n2. 登录\n3. 验证首页",
        expected: "成功显示首页内容",
        createdById: user.id,
        testPlanId: testPlan.id,
      },
    });

    // 创建测试执行记录
    const execution = await prisma.testExecution.create({
      data: {
        testPlanId: testPlan.id,
        testCaseId: testCase.id,
        executedById: user.id,
        status: "PASSED",
        result: "测试通过",
      },
    });

    return NextResponse.json({
      message: "测试数据创建成功",
      execution,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "创建测试数据失败" },
      { status: 500 }
    );
  }
}
