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

export function CreateTestCase() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    steps: "",
    expected: "",
    priority: "P2"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch("/api/test-cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form)
    })

    if (response.ok) {
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>创建测试用例</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新测试用例</DialogTitle>
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
              placeholder="输入测试用例描述"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="steps">测试步骤</Label>
            <textarea
              id="steps"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.steps}
              placeholder="输入测试步骤，每行一个步骤"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, steps: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>优先级</Label>
            <Select 
              value={form.priority}
              onValueChange={(value) => setForm({...form, priority: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P0">P0 - 最高</SelectItem>
                <SelectItem value="P1">P1 - 高</SelectItem>
                <SelectItem value="P2">P2 - 中</SelectItem>
                <SelectItem value="P3">P3 - 低</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expected">预期结果</Label>
            <textarea
              id="expected"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.expected}
              placeholder="输入预期结果"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, expected: e.target.value})}
              required
            />
          </div>
          <Button type="submit">提交</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
