"use client"
import { useState, useEffect } from "react"
import { useProject } from "@/components/layout/ProjectSwitcher"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Bug } from "@prisma/client"
import { EditBug } from "./EditBug"

export function BugList() {
  const { currentProject } = useProject()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setIsLoading(true)
        const url = currentProject 
          ? `/api/bugs?projectId=${currentProject.id}`
          : '/api/bugs'
        const response = await fetch(url)
        if (response.ok) {
          setBugs(await response.json())
        }
      } catch (error) {
        console.error('Failed to fetch bugs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBugs()
  }, [currentProject?.id])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredBugs = bugs.filter(bug => {
    return bug.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           bug.description?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleDelete = async (id: string) => {
    await fetch(`/api/bugs/${id}`, {
      method: "DELETE",
    })
    setBugs(bugs.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="搜索缺陷..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Card className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-[500px] overflow-auto">
          <Table className="[&_tr:hover]:bg-muted/50 [&_tr]:transition-colors">
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关联工单</TableHead>
                <TableHead>关联测试用例</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBugs.map((bug) => (
                <TableRow key={bug.id}>
                  <TableCell>{bug.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bug.priority === "P0"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {bug.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bug.status === "CLOSED"
                          ? "success"
                          : bug.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {bug.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{bug.ticketId}</TableCell>
                  <TableCell>{bug.testCaseId || "无"}</TableCell>
                  <TableCell>
                    {new Date(bug.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <EditBug
                      bug={bug}
                      onSuccess={async () => {
                        const response = await fetch("/api/bugs")
                        if (response.ok) {
                          setBugs(await response.json())
                        }
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bug.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
