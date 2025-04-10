import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CreateTestPlan } from "./CreateTestPlan";

export function TestPlanList() {
  // TODO: 从API获取测试计划数据
  const testPlans = [
    {
      id: "1",
      name: "登录功能测试",
      description: "测试用户登录流程",
      status: "进行中",
      startDate: "2025-04-01",
      endDate: "2025-04-10"
    },
    {
      id: "2",
      name: "支付功能测试",
      description: "测试支付流程",
      status: "未开始",
      startDate: "2025-04-15",
      endDate: "2025-04-20"
    }
  ];

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
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={plan.status === '进行中' ? 'default' : 'secondary'}
                    >
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.startDate}</TableCell>
                  <TableCell>{plan.endDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost">编辑</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
