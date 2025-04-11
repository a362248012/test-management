"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AIGenerateTestCases() {
  const [tickets, setTickets] = useState<{id: string, title: string, description: string, projectId: string}[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets?includeProject=true");
        if (!response.ok) throw new Error("获取工单失败");
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取工单失败");
      }
    };
    fetchTickets();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTicketId) {
      setError("请选择工单");
      return;
    }

    setIsGenerating(true);
    setError("");
    setTestCases("");
    
    try {
      const selectedTicket = tickets.find(t => t.id === selectedTicketId);
      const prompt = `${selectedTicket?.description || ""}\n\n${additionalNotes}`;
      
      const response = await fetch("/api/ai/generate-test-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ticketId: selectedTicketId,
          prompt 
        }),
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
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">AI测试用例生成</h3>
      <div className="space-y-4">
          <div className="space-y-4">
            <Label>选择工单</Label>
            <Select onValueChange={setSelectedTicketId}>
              <SelectTrigger>
                <SelectValue placeholder="选择工单..." />
              </SelectTrigger>
              <SelectContent>
                {tickets.map(ticket => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    {ticket.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label>补充描述</Label>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="输入补充描述或测试重点..."
                className="min-h-[100px]"
              />
            </div>

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
              <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                {testCases}
              </div>
              <Button 
                variant="outline" 
                className="mt-2 mr-2"
                onClick={() => navigator.clipboard.writeText(testCases)}
              >
                复制到剪贴板
              </Button>
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
                    if (!selectedTicket) throw new Error('工单不存在');

                    const response = await fetch('/api/test-cases', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: `AI生成用例-${new Date().toLocaleString()}`,
                        steps: testCases,
                        expected: '详见步骤描述',
                        isAIGenerated: true,
                        projectId: selectedTicket.projectId,
                        relatedTickets: {
                          connect: [{ id: selectedTicketId }]
                        }
                      })
                    });
                    if (!response.ok) throw new Error('保存失败');
                    alert('已添加到测试用例');
                  } catch (err) {
                    alert(err instanceof Error ? err.message : '保存失败');
                  }
                }}
              >
                添加到测试用例
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
