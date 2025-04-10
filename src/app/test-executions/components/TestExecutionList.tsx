/** @format */

"use client"

import { useState } from "react"
import { TestExecution } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TestExecutionDetail } from "./TestExecutionDetail"

interface TestExecutionListProps {
  executions: (TestExecution & {
    testPlan: {
      name: string
    }
    testCase: {
      title: string
      steps: string
      expected: string
    }
    executedBy: {
      name: string | null
    }
  })[]
}

export function TestExecutionList({ executions }: TestExecutionListProps) {
  const [selectedExecutionIndex, setSelectedExecutionIndex] = useState<
    number | null
  >(null)
  const selectedExecution =
    selectedExecutionIndex !== null
      ? executions[selectedExecutionIndex]
      : undefined
  return (
    <>
      <Card className="p-4">
        <div className="relative h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>测试计划</TableHead>
                <TableHead>测试用例</TableHead>
                <TableHead>执行人</TableHead>
                <TableHead>执行时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution, index) => (
                <TableRow key={execution.id}>
                  <TableCell>{execution.testPlan.name}</TableCell>
                  <TableCell>{execution.testCase.title}</TableCell>
                  <TableCell>{execution.executedBy.name || "未知"}</TableCell>
                  <TableCell>
                    {new Date(execution.executedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(execution.status)}>
                      {execution.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{execution.result || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExecutionIndex(index)}
                    >
                      详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      {selectedExecution && (
        <TestExecutionDetail
          execution={selectedExecution as NonNullable<typeof selectedExecution>}
          open={selectedExecutionIndex !== null}
          onOpenChange={(open) => !open && setSelectedExecutionIndex(null)}
        />
      )}
    </>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case "PASSED":
      return "success"
    case "FAILED":
      return "destructive"
    case "PENDING":
      return "secondary"
    default:
      return "default"
  }
}
