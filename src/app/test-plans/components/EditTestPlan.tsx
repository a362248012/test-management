"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { TestPlan } from "@/types/test-plan";

interface EditTestPlanProps {
  plan: TestPlan;
}

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function EditTestPlan({ plan }: EditTestPlanProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: plan
  })

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/test-plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("更新失败")
      }

      toast.success("测试计划已更新")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("更新测试计划失败")
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">编辑</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑测试计划</DialogTitle>
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
            <Textarea
              id="desc"
              className="col-span-3 min-h-[100px]"
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              计划内容
            </Label>
            <Textarea
              id="content"
              className="col-span-3 min-h-[100px]"
              {...register("content")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="implementation" className="text-right">
              实施方案
            </Label>
            <Textarea
              id="implementation"
              className="col-span-3 min-h-[100px]"
              {...register("implementation")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              状态
            </Label>
            <Select 
              defaultValue={plan.status}
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
              {...register("startDate", { required: true })}
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
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
