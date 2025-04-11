"use client"
import { useState, useEffect } from "react"
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
import { Priority } from "@/lib/constants"

export function CreateBug() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: Priority.P2,
    status: "OPEN",
    ticketId: "",
    testCaseId: "",
    projectId: ""
  })
  const [tickets, setTickets] = useState<{id: string, title: string}[]>([])
  const [testCases, setTestCases] = useState<{id: string, title: string}[]>([])
  const [projects, setProjects] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    if (!open) return
    
    const fetchData = async () => {
      try {
        const [ticketsRes, testCasesRes, projectsRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/test-cases'),
          fetch('/api/projects')
        ])
        
        if (ticketsRes.ok) {
          setTickets(await ticketsRes.json())
        }
        if (testCasesRes.ok) {
          setTestCases(await testCasesRes.json())
        }
        if (projectsRes.ok) {
          setProjects(await projectsRes.json())
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    }
    
    fetchData()
  }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      // 验证必填字段
      if (!form.title || !form.projectId) {
        alert('请填写标题并选择项目')
        return
      }

      console.log('Submitting form:', form)
      
      try {
        const response = await fetch(`/api/bugs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            status: "OPEN", // 确保包含状态字段
            ticketId: form.ticketId || null, // 处理空值
            testCaseId: form.testCaseId || null // 处理空值
          })
        })

        const result = await response.json()
        console.log('API response:', result)

        if (response.ok) {
          setOpen(false)
          window.location.reload()
        } else {
          console.error('Failed to create bug:', result.error)
          alert(`创建失败: ${result.error}`)
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('提交过程中发生错误')
      }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增缺陷</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增缺陷</DialogTitle>
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
            <Label>项目</Label>
            <Select
              value={form.projectId}
              onValueChange={(value) => setForm({...form, projectId: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label>关联工单</Label>
            <Select
              value={form.ticketId}
              onValueChange={(value) => setForm({...form, ticketId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择关联工单" />
              </SelectTrigger>
              <SelectContent>
                {tickets.map(ticket => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    {ticket.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>关联测试用例</Label>
            <Select
              value={form.testCaseId}
              onValueChange={(value) => setForm({...form, testCaseId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择关联测试用例" />
              </SelectTrigger>
              <SelectContent>
                {testCases.map(testCase => (
                  <SelectItem key={testCase.id} value={testCase.id}>
                    {testCase.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">创建</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
