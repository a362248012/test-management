/** @format */

import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import PassFailTrendChart from "@/components/charts/PassFailTrendChart"
import TestPlanProgressChart from "@/components/charts/TestPlanProgressChart"
import TestStatsChart from "@/components/charts/TestStatsChart"
import SystemHealth from "@/components/SystemHealth"

function getLastReleaseDate() {
  const today = new Date()
  const day = today.getDay() // 0=Sunday, 1=Monday, etc.
  
  // If today is Tuesday (2) or Thursday (4)
  if (day === 2 || day === 4) {
    return today
  }
  
  // Otherwise find the most recent Tuesday or Thursday
  const lastTuesday = new Date(today)
  lastTuesday.setDate(today.getDate() - (day > 2 ? day - 2 : day + 5))
  
  const lastThursday = new Date(today)
  lastThursday.setDate(today.getDate() - (day > 4 ? day - 4 : day + 3))
  
  return lastTuesday > lastThursday ? lastTuesday : lastThursday
}

async function getRecentTestCases(userId: string) {
  try {
    const lastReleaseDate = getLastReleaseDate()
    lastReleaseDate.setHours(0, 0, 0, 0)
    
    return await prisma.testCase.findMany({
      where: {
        createdById: userId,
        OR: [
          { createdAt: { gte: lastReleaseDate } },
          { updatedAt: { gte: lastReleaseDate } }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })
  } catch (error) {
    console.error('Error fetching recent test cases:', error)
    return []
  }
}

async function getTestExecutionStats(userId: string) {
  try {
    const executions = await prisma.testExecution.findMany({
      where: {
        executedById: userId
      },
      orderBy: {
        executedAt: 'asc'
      }
    })

    // Group by date and calculate pass/fail rates
    const dailyStats: Record<string, { total: number; passed: number }> = {}

    executions.forEach(exec => {
      const date = exec.executedAt.toISOString().split('T')[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, passed: 0 }
      }
      dailyStats[date].total++
      if (exec.result === 'PASSED') {
        dailyStats[date].passed++
      }
    })

    // Convert to trend data format
    const realData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      passRate: Math.round((stats.passed / stats.total) * 100),
      failRate: Math.round(((stats.total - stats.passed) / stats.total) * 100)
    }))

    // Return real data if exists, otherwise mock data
    return realData.length > 0 ? realData : [
      { date: '2025-04-01', passRate: 85, failRate: 15 },
      { date: '2025-04-02', passRate: 82, failRate: 18 },
      { date: '2025-04-03', passRate: 88, failRate: 12 },
      { date: '2025-04-04', passRate: 90, failRate: 10 },
      { date: '2025-04-05', passRate: 92, failRate: 8 },
      { date: '2025-04-06', passRate: 95, failRate: 5 },
      { date: '2025-04-07', passRate: 97, failRate: 3 },
    ]
  } catch (error) {
    console.error('Error fetching test execution stats:', error)
    return [
      { date: '2025-04-01', passRate: 85, failRate: 15 },
      { date: '2025-04-02', passRate: 82, failRate: 18 },
      { date: '2025-04-03', passRate: 88, failRate: 12 },
      { date: '2025-04-04', passRate: 90, failRate: 10 },
      { date: '2025-04-05', passRate: 92, failRate: 8 },
      { date: '2025-04-06', passRate: 95, failRate: 5 },
      { date: '2025-04-07', passRate: 97, failRate: 3 },
    ]
  }
}

async function getTestCaseCount(userId: string) {
  try {
    const counts = await prisma.testCase.groupBy({
      by: ['status'],
      where: {
        createdById: userId
      },
      _count: {
        _all: true
      }
    })
    
    return {
      total: counts.reduce((sum, item) => sum + item._count._all, 0),
      passed: counts.find(item => item.status === 'PASSED')?._count._all || 0,
      failed: counts.find(item => item.status === 'FAILED')?._count._all || 0,
      other: counts
        .filter(item => !['PASSED', 'FAILED'].includes(item.status))
        .reduce((sum, item) => sum + item._count._all, 0)
    }
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return {
      total: 0,
      passed: 0,
      failed: 0,
      other: 0
    }
  }
}

async function getTestPlanProgress(userId: string) {
  try {
    const testPlans = await prisma.testPlan.findMany({
      where: {
        createdById: userId,
      },
      include: {
        testCases: true,
      },
    });

    if (testPlans.length === 0) return 0;

    // 计算所有测试计划的平均进度
    const totalProgress = testPlans.reduce((sum, plan) => {
      // 如果测试计划状态为已完成，直接计为100%
      if (plan.status === "COMPLETED") {
        return sum + 100;
      }

      // 否则计算测试用例完成百分比
      const totalTestCases = plan.testCases.length;
      if (totalTestCases === 0) return sum + 0;

      const completedTestCases = plan.testCases.filter(
        (tc) => tc.status === "COMPLETED" || tc.status === "PASSED"
      ).length;
      
      return sum + Math.round((completedTestCases / totalTestCases) * 100);
    }, 0);

    return Math.round(totalProgress / testPlans.length);
  } catch (error) {
    console.error("Error fetching test plan progress:", error);
    return 0;
  }
}

async function getTestStats(userId: string) {
  try {
    const testCaseCount = await prisma.testCase.count({
      where: {
        createdById: userId,
      },
    });

    const testExecutions = await prisma.testExecution.findMany({
      where: {
        executedById: userId,
      },
    });

    const executedTestCaseCount = testExecutions.length;
    const passedTestCaseCount = testExecutions.filter(
      (exec) => exec.result === "PASSED"
    ).length;
    const failedTestCaseCount = executedTestCaseCount - passedTestCaseCount;

    const testPlanCount = await prisma.testPlan.count({
      where: {
        createdById: userId,
      },
    });

    const completedTestPlanCount = await prisma.testPlan.count({
      where: {
        createdById: userId,
        status: "COMPLETED", // 假设测试计划有一个 "status" 字段
      },
    });

    return [
      { name: "测试用例总数", value: testCaseCount, color: "#8884d8" },
      { name: "已执行的测试用例", value: executedTestCaseCount, color: "#82ca9d" },
      { name: "通过的测试用例", value: passedTestCaseCount, color: "#a4de6c" },
      { name: "失败的测试用例", value: failedTestCaseCount, color: "#d04a4a" },
      { name: "测试计划总数", value: testPlanCount, color: "#8ac4ff" },
      { name: "已完成的测试计划", value: completedTestPlanCount, color: "#ffc658" },
    ];
  } catch (error) {
    console.error("Error fetching test stats:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id || "";
  const testCaseCount = await getTestCaseCount(userId);
  const recentTestCases = await getRecentTestCases(userId);
  const trendData = await getTestExecutionStats(userId);
  const testStatsData = await getTestStats(userId); // 获取测试统计数据

  return (
    <div className="container py-8 page-transition">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">测试项目和工单的概览信息。</p>
      </div>
      
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <EnhancedCard
          className="bg-gradient-to-br from-primary/10 to-primary/5"
          hover={true}
          borderStyle="accent"
        >
          <div className="flex flex-col items-center text-center p-2">
            <div className="size-12 rounded-full flex items-center justify-center bg-primary/10 mb-3">
              <TicketIcon className="size-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">258</h3>
            <p className="text-sm text-muted-foreground">总工单数量</p>
          </div>
        </EnhancedCard>
        
        <EnhancedCard
          className="bg-gradient-to-br from-amber-500/10 to-amber-500/5"
          hover={true}
          borderStyle="accent"
        >
          <div className="flex flex-col items-center text-center p-2">
            <div className="size-12 rounded-full flex items-center justify-center bg-amber-500/10 mb-3">
              <ClockIcon className="size-6 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold">42</h3>
            <p className="text-sm text-muted-foreground">处理中工单</p>
          </div>
        </EnhancedCard>
        
        <EnhancedCard
          className="bg-gradient-to-br from-green-500/10 to-green-500/5"
          hover={true}
          borderStyle="accent"
        >
          <div className="flex flex-col items-center text-center p-2">
            <div className="size-12 rounded-full flex items-center justify-center bg-green-500/10 mb-3">
              <CheckCircleIcon className="size-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold">189</h3>
            <p className="text-sm text-muted-foreground">已解决工单</p>
          </div>
        </EnhancedCard>
        
        <EnhancedCard
          className="bg-gradient-to-br from-red-500/10 to-red-500/5"
          hover={true}
          borderStyle="accent"
        >
          <div className="flex flex-col items-center text-center p-2">
            <div className="size-12 rounded-full flex items-center justify-center bg-red-500/10 mb-3">
              <AlertCircleIcon className="size-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold">27</h3>
            <p className="text-sm text-muted-foreground">待解决BUG</p>
          </div>
        </EnhancedCard>
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EnhancedCard 
          title="工单趋势" 
          description="过去30天的工单创建与解决趋势"
          className="enhanced-shadow"
        >
          <div className="aspect-[4/3]">
            {/* 此处放置趋势线图组件 */}
            <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center">
              图表组件
            </div>
          </div>
        </EnhancedCard>
        
        <EnhancedCard 
          title="工单类型分布" 
          description="各类工单的数量分布"
          className="enhanced-shadow"
        >
          <div className="aspect-[4/3]">
            {/* 此处放置饼图组件 */}
            <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center">
              饼图组件
            </div>
          </div>
        </EnhancedCard>
      </div>
      
      {/* 最近工单 */}
      <EnhancedCard 
        title="最近工单" 
        description="最近创建和更新的工单"
        className="enhanced-shadow mb-8"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-3">ID</th>
                <th className="text-left font-medium p-3">标题</th>
                <th className="text-left font-medium p-3">状态</th>
                <th className="text-left font-medium p-3">优先级</th>
                <th className="text-left font-medium p-3">创建时间</th>
                <th className="text-left font-medium p-3">负责人</th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3"><span className="font-mono text-xs">#T-{1000 + i}</span></td>
                  <td className="p-3"><Link href={`/tickets/${i}`} className="hover:underline text-primary font-medium">示例工单标题 {i+1}</Link></td>
                  <td className="p-3">
                    <Badge variant={i % 3 === 0 ? "secondary" : i % 3 === 1 ? "secondary" : "default"}>
                      {i % 3 === 0 ? "待处理" : i % 3 === 1 ? "处理中" : "已完成"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={i % 3 === 0 ? "destructive" : i % 3 === 1 ? "default" : "secondary"}>
                      {i % 3 === 0 ? "高" : i % 3 === 1 ? "中" : "低"}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-sm">2023-04-{10 + i}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{["ZY", "WH", "LM", "CJ", "YT"][i][0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{["张三", "李四", "王五", "赵六", "钱七"][i]}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <Button size="sm" variant="outline" asChild>
            <Link href="/tickets">
              查看全部工单
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </EnhancedCard>
      
      {/* 项目进度 */}
      <EnhancedCard 
        title="项目进度" 
        description="当前活跃项目的完成情况"
        className="enhanced-shadow"
      >
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">项目 {i+1}</div>
                <div className="text-sm text-muted-foreground">{30 + i*20}%</div>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${30 + i*20}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>开始: 2023-03-01</div>
                <div>预计完成: 2023-06-30</div>
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard>
    </div>
  )
}
