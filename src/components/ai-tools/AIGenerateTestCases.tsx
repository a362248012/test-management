"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";

// 保留组件但不再使用，已迁移到页面直接实现
export function AIGenerateTestCases() {
  const [requirement, setRequirement] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      setError("请输入需求描述");
      return;
    }

    setIsGenerating(true);
    setError("");
    setTestCases("");
    
    try {
      const response = await fetch("/api/ai/generate-test-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirement }),
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
        setTestCases(prev => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">生成测试用例</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI测试用例生成</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>需求描述</Label>
            <Input
              value={requirement}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequirement(e.target.value)}
              placeholder="输入需求描述或用户故事..."
              className="min-h-[120px]"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4"
          >
            {isGenerating ? "生成中..." : "生成测试用例"}
          </Button>
          
          {testCases && (
            <div className="mt-6 space-y-2">
              <Label>生成的测试用例</Label>
              <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap max-h-[400px] overflow-auto">
                {testCases}
              </div>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => navigator.clipboard.writeText(testCases)}
              >
                复制到剪贴板
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
