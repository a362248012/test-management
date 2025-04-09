"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestExecution } from "@prisma/client";

interface TestExecutionDetailProps {
  execution: TestExecution & {
    testPlan: {
      name: string;
    };
    testCase: {
      title: string;
      steps: string;
      expected: string;
    };
    executedBy: {
      name: string | null;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestExecutionDetail({
  execution,
  open,
  onOpenChange,
}: TestExecutionDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>测试执行详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">测试计划</h3>
              <p>{execution.testPlan.name}</p>
            </div>
            <div>
              <h3 className="font-medium">测试用例</h3>
              <p>{execution.testCase.title}</p>
            </div>
            <div>
              <h3 className="font-medium">执行人</h3>
              <p>{execution.executedBy.name || "未知"}</p>
            </div>
            <div>
              <h3 className="font-medium">执行时间</h3>
              <p>{new Date(execution.executedAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium">状态</h3>
              <p>{execution.status}</p>
            </div>
            <div>
              <h3 className="font-medium">结果</h3>
              <p>{execution.result || "-"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">测试步骤</h3>
            <pre className="whitespace-pre-wrap p-2 bg-gray-100 rounded">
              {execution.testCase.steps}
            </pre>
          </div>
          <div>
            <h3 className="font-medium">预期结果</h3>
            <pre className="whitespace-pre-wrap p-2 bg-gray-100 rounded">
              {execution.testCase.expected}
            </pre>
          </div>
          <div>
            <h3 className="font-medium">备注</h3>
            <p>{execution.comments || "无备注"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
