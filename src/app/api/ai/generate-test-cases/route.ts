import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { requirement } = await req.json();

  try {
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
            content: "你是一个专业的测试工程师，请根据需求生成详细的测试用例，包含测试步骤、预期结果和优先级。"
          },
          {
            role: "user",
            content: `根据以下需求生成测试用例：\n${requirement}`
          }
        ],
        temperature: 0.7,
        stream: true
      })
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data:") && !line.includes("[DONE]")) {
              try {
                const data = JSON.parse(line.slice(5));
                const content = data.choices[0]?.delta?.content || "";
                controller.enqueue(new TextEncoder().encode(content));
              } catch (e) {
                console.error("Error parsing stream data:", e);
              }
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "生成测试用例失败" },
      { status: 500 }
    );
  }
}
