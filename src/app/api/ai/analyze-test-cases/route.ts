import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Priority, TestCase, TestExecution } from "@prisma/client";

export async function POST(req: Request) {
  const { dateRange, priorities } = await req.json();

  try {
    // 获取测试用例数据
    const testCases = await prisma.testCase.findMany({
      where: {
        createdAt: {
          gte: dateRange?.start ? new Date(dateRange.start) : undefined,
          lte: dateRange?.end ? new Date(dateRange.end) : undefined
        },
        priority: priorities?.length ? { in: priorities } : undefined
      },
      include: {
        executions: true
      }
    });

    // 准备分析数据
    const analysisData = {
      totalCases: testCases.length,
      priorityDistribution: testCases.reduce((acc: Record<string, number>, curr: TestCase) => {
        acc[curr.priority] = (acc[curr.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      failurePatterns: testCases
        .filter((tc: TestCase & { executions: TestExecution[] }) => 
          tc.executions.some((e: TestExecution) => e.status === "FAILED"))
        .map((tc: TestCase & { executions: TestExecution[] }) => ({
          id: tc.id,
          title: tc.title,
          failureCount: tc.executions.filter((e: TestExecution) => e.status === "FAILED").length
        })),
      commonKeywords: extractKeywords(testCases.map(tc => tc.title))
    };

    // 调用AI分析
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一个专业的测试分析师。请基于以下测试数据提供分析建议：
            - 测试用例总数: ${analysisData.totalCases}
            - 优先级分布: ${JSON.stringify(analysisData.priorityDistribution)}
            - 常见失败模式: ${JSON.stringify(analysisData.failurePatterns)}
            - 关键词分析: ${analysisData.commonKeywords.join(", ")}
            
            请提供：
            1. 测试覆盖度分析
            2. 优先级优化建议
            3. 常见失败模式总结
            4. 潜在的新测试用例建议`
          }
        ],
        temperature: 0.7
      })
    });

    const aiResponse = await response.json();
    return NextResponse.json({
      ...analysisData,
      aiAnalysis: aiResponse.choices[0].message.content
    });

  } catch (error) {
    return NextResponse.json(
      { error: "分析测试用例失败" },
      { status: 500 }
    );
  }
}

function extractKeywords(titles: string[]): string[] {
  const words = titles.flatMap(title => title.split(/\s+/));
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) { // 忽略短词
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}
