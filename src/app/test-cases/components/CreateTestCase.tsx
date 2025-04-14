"use client"
import { useState, useEffect } from "react"
import { useProject } from "@/components/layout/ProjectSwitcher"
import { useSession } from "next-auth/react" // 添加 session 导入
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
import { Alert, AlertDescription } from "@/components/ui/alert"

// 定义工单类型接口
interface Ticket {
  id: string;
  title: string;
}

export function CreateTestCase() {
  const [open, setOpen] = useState(false)
  const { currentProject } = useProject()
  const { data: session } = useSession() // 获取当前用户会话
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    steps: "",
    expected: "",
    priority: "P2",
    projectId: currentProject?.id || "",
    ticketId: "" // 添加工单ID字段
  })

  // 当 currentProject 变化时更新表单的 projectId 并获取该项目下的工单
  useEffect(() => {
    if (currentProject?.id) {
      setForm(prev => ({...prev, projectId: currentProject.id, ticketId: ""}))
      setErrorMessage(null)
      
      // 获取项目下的工单列表
      fetchTickets(currentProject.id);
    }
  }, [currentProject])
  
  // 获取工单列表的函数
  const fetchTickets = async (projectId: string) => {
    try {
      const response = await fetch(`/api/tickets?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        console.error("获取工单失败");
      }
    } catch (error) {
      console.error("获取工单出错:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentProject?.id) {
      setErrorMessage("当前未选择项目");
      return;
    }
    
    if (!form.ticketId) {
      setErrorMessage("请选择关联工单");
      return;
    }

    try {
      const response = await fetch("/api/test-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          projectId: currentProject.id,
          // 正确格式化关联的工单
          relatedTickets: {
            connect: [{ id: form.ticketId }]
          }
        })
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "创建测试用例失败");
      }
    } catch (error) {
      console.error("创建测试用例时出错:", error);
      setErrorMessage("提交过程中发生错误");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => {
          if (!currentProject?.id) {
            setErrorMessage("请先在顶部导航栏选择一个项目")
            setTimeout(() => setErrorMessage(null), 3000)
          } else {
            setErrorMessage(null)
          }
        }}>创建测试用例</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新测试用例</DialogTitle>
        </DialogHeader>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 添加工单选择 */}
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
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    暂无工单
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
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
