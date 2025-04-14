"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProject } from "@/components/layout/ProjectSwitcher";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CreateTestPlan } from "./CreateTestPlan";
import { EditTestPlan } from "./EditTestPlan";
import useSWR from "swr";
import { TestPlan } from "@/types/test-plan";

export function TestPlanList() {
  const { currentProject } = useProject();
  const { data, isLoading, mutate } = useSWR<TestPlan[] | { testPlans: TestPlan[] }>(
    `/api/test-plans${currentProject ? `?projectId=${currentProject.id}` : ''}`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  // 处理数据，确保 testPlans 是一个数组
  const testPlans = Array.isArray(data) ? data : data?.testPlans || [];

  if (isLoading) return <div>加载中...</div>;
  if (!testPlans) return <div>加载失败</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="搜索测试计划..." className="max-w-sm" />
        <CreateTestPlan />
      </div>
      <Card className="p-4">
        <div className="relative h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>计划名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>开始日期</TableHead>
                <TableHead>结束日期</TableHead>
                <TableHead>实施方案</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(testPlans) && testPlans.length > 0 ? (
                testPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.status === 'COMPLETED' ? 'default' : 'secondary'}
                      >
                        {plan.status === 'COMPLETED' ? '已完成' : '进行中'}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.startDate}</TableCell>
                    <TableCell>{plan.endDate}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {plan.implementation || "未设置"}
                    </TableCell>
                    <TableCell>
                      <EditTestPlan plan={plan} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    暂无测试计划数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
