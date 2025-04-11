"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProject } from "@/components/layout/ProjectSwitcher"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { TestPlan } from "@/types/test-plan"

export function CreateTestPlan() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { projects } = useProject()
  const { register, handleSubmit, reset, setValue } = useForm<TestPlan & { projectId?: string }>()

  const onSubmit = async (data: TestPlan) => {
    try {
      const response = await fetch("/api/test-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("创建失败")
      }

      toast.success("测试计划已创建")
      setOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      toast.error("创建测试计划失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">创建测试计划</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建测试计划</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              计划名称
            </Label>
            <Input 
              id="name" 
              className="col-span-3" 
              {...register("name", { required: true })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desc" className="text-right">
              描述
            </Label>
            <Input 
              id="desc" 
              className="col-span-3 h-20" 
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              状态
            </Label>
            <Select 
              onValueChange={(value: TestPlan['status']) => setValue("status", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">计划中</SelectItem>
                <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              开始日期
            </Label>
            <Input 
              id="startDate" 
              type="date" 
              className="col-span-3" 
              {...register("startDate")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              结束日期
            </Label>
            <Input 
              id="endDate" 
              type="date" 
              className="col-span-3" 
              {...register("endDate")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              所属项目
            </Label>
            <Select 
              onValueChange={(value: string) => setValue("projectId", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              创建
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
