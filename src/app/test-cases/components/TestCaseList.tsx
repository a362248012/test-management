"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TestCase } from "@prisma/client"
import { EditTestCase } from "./EditTestCase"

interface TestCaseListProps {
  testCases: TestCase[]
}

export function TestCaseList({ testCases }: TestCaseListProps) {
  const [cases, setCases] = useState(testCases)

  const handleDelete = async (id: string) => {
    await fetch(`/api/test-cases/${id}`, {
      method: "DELETE"
    })
    setCases(cases.filter(c => c.id !== id))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标题</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建人</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((testCase) => (
          <TableRow key={testCase.id}>
            <TableCell>{testCase.title}</TableCell>
            <TableCell>{testCase.status}</TableCell>
            <TableCell>{testCase.createdById}</TableCell>
            <TableCell>{new Date(testCase.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <EditTestCase 
                testCase={testCase}
                onSuccess={async () => {
                  const response = await fetch('/api/test-cases')
                  if (response.ok) {
                    setCases(await response.json())
                  }
                }}
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="ml-2"
                onClick={() => handleDelete(testCase.id)}
              >
                删除
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
