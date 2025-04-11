import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: Request) {
  try {
    const { objective } = await req.json();
    
    if (!objective) {
      return new NextResponse("缺少测试目标", { status: 400 });
    }

    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是一个专业的测试工程师，请根据用户提供的测试目标生成详细的测试计划。
          测试计划应包括：
          1. 计划名称
          2. 测试范围
          3. 测试策略
          4. 资源需求
          5. 时间安排
          6. 风险分析
          7. 具体实施方案（详细步骤、责任人、验收标准）
          请用Markdown格式返回结果，确保包含完整的实施方案细节。`
        },
        {
          role: "user",
          content: objective
        }
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new NextResponse(streamResponse, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[AI_GENERATE_TEST_PLANS_ERROR]", error);
    return new NextResponse(`生成测试计划失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`, { status: 500 });
  }
}
