"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bug } from "@prisma/client"
import { Priority } from "@/lib/constants"

interface EditBugProps {
  bug: Bug
  onSuccess?: () => void
}

export function EditBug({ bug, onSuccess }: EditBugProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: bug.title,
    description: bug.description || "",
    priority: bug.priority || Priority.P2,
    status: bug.status || "OPEN",
    ticketId: bug.ticketId,
    testCaseId: bug.testCaseId || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch(`/api/bugs`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: bug.id,
        ...form
      })
    })

    if (response.ok) {
      setOpen(false)
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">编辑</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑缺陷</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">描述</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.description}
              placeholder="输入缺陷描述"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})}
            />
          </div>
          <div>
            <Label>优先级</Label>
            <Select 
              value={form.priority}
              onValueChange={(value) => setForm({...form, priority: value as Priority})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Priority.P0}>P0 - 最高</SelectItem>
                <SelectItem value={Priority.P1}>P1 - 高</SelectItem>
                <SelectItem value={Priority.P2}>P2 - 中</SelectItem>
                <SelectItem value={Priority.P3}>P3 - 低</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>状态</Label>
            <Select 
              value={form.status}
              onValueChange={(value) => setForm({...form, status: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">待处理</SelectItem>
                <SelectItem value="FIXED">已修复</SelectItem>
                <SelectItem value="CLOSED">已关闭</SelectItem>
                <SelectItem value="REJECTED">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ticketId">关联工单ID</Label>
            <Input
              id="ticketId"
              value={form.ticketId}
              onChange={(e) => setForm({...form, ticketId: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="testCaseId">关联测试用例ID</Label>
            <Input
              id="testCaseId"
              value={form.testCaseId || ""}
              onChange={(e) => setForm({...form, testCaseId: e.target.value})}
            />
          </div>
          <Button type="submit">保存</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
