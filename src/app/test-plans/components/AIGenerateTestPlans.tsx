"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { marked } from "marked";
import { useRouter } from "next/navigation";

export function AIGenerateTestPlans() {
  const router = useRouter();
  const [objective, setObjective] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testPlan, setTestPlan] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!objective.trim()) {
      setError("请输入测试目标");
      return;
    }

    setIsGenerating(true);
    setError("");
    setTestPlan("");
    
    try {
      const response = await fetch("/api/ai/generate-test-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objective }),
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        result += chunk;
        setTestPlan(prev => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1">
        <Label>生成的测试计划</Label>
        <div
          className="p-4 bg-gray-50 rounded-md min-h-[300px] overflow-auto prose"
          dangerouslySetInnerHTML={{
            __html: marked.parse(
              testPlan || '<p class="text-gray-400">生成的测试计划将显示在这里</p>'
            ),
          }}
        />
      </div>
      
      <div className="space-y-2">
        <Label>测试目标</Label>
        <Textarea
          value={objective}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObjective(e.target.value)}
          placeholder="输入测试目标或产品功能描述..."
          className="min-h-[120px]"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? "生成中..." : "生成测试计划"}
          </Button>
          
          {testPlan && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigator.clipboard.writeText(testPlan)}
                disabled={isGenerating}
              >
                复制到剪贴板
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={isGenerating || isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const response = await fetch('/api/test-plans', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: `AI生成测试计划 - ${new Date().toLocaleString()}`,
                        description: objective,
                        content: testPlan,
                        implementation: "待填写", // 实施方案字段
                        status: 'DRAFT',
                        isAIGenerated: true,
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                      })
                    });
                    
                    if (response.ok) {
                      router.refresh();
                    } else {
                      throw new Error('保存失败');
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : '保存失败');
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? "保存中..." : "保存为测试计划"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
