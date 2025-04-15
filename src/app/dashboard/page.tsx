/** @format */

import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EnhancedCard } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { TicketStatus } from "@prisma/client"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"

// 导入客户端图表包装组件而不是直接使用 Recharts 组件
import PassFailTrendChartWrapper from "@/components/charts/PassFailTrendChartWrapper"
import TestPlanProgressChartWrapper from "@/components/charts/TestPlanProgressChartWrapper"
import TestStatsChartWrapper from "@/components/charts/TestStatsChartWrapper"
import TicketStatusChartWrapper from "@/components/charts/TicketStatusChartWrapper"
import SystemHealth from "@/components/SystemHealth"

// 更合理的发布日期计算逻辑
function getLastReleaseDate() {
  const today = new Date()
  const day = today.getDay() // 0=Sunday, 1=Monday, etc.
  
  // 如果今天是发布日（周二或周四）
  if (day === 2 || day === 4) {
    const todayCopy = new Date(today)
    todayCopy.setHours(0, 0, 0, 0)
    return todayCopy
  }
  
  // 找到最近的发布日
  const daysToSubtract = day === 0 ? 3 : // 周日 -> 上周四
                         day === 1 ? 5 : // 周一 -> 上周四
                         day === 3 ? 1 : // 周三 -> 周二
                         day === 5 ? 1 : // 周五 -> 周四
                         day === 6 ? 2 : 0; // 周六 -> 周四
  
  const lastReleaseDate = new Date(today)
  lastReleaseDate.setDate(today.getDate() - daysToSubtract)
  lastReleaseDate.setHours(0, 0, 0, 0)
  return lastReleaseDate
}

async function getRecentTestCases(userId: string) {
  if (!userId) return []
  
  try {
    const lastReleaseDate = getLastReleaseDate()
    
    const recentCases = await prisma.testCase.findMany({
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
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        updatedAt: true
      }
    })
    
    return recentCases
  } catch (error) {
    console.error('Error fetching recent test cases:', error)
    return []
  }
}

async function getTestExecutionStats(userId: string) {
  if (!userId) {
    return getMockTrendData()
  }
  
  try {
    // 获取过去30天的数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const executions = await prisma.testExecution.findMany({
      where: {
        executedById: userId,
        executedAt: { gte: thirtyDaysAgo }
      },
      orderBy: {
        executedAt: 'asc'
      }
    })

    if (executions.length === 0) {
      return getMockTrendData()
    }

    // 按日期分组计算通过/失败率
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

    // 转换为趋势数据格式
    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      passRate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
      failRate: stats.total > 0 ? Math.round(((stats.total - stats.passed) / stats.total) * 100) : 0
    }))
  } catch (error) {
    console.error('Error fetching test execution stats:', error)
    return getMockTrendData()
  }
}

function getMockTrendData() {
  const today = new Date()
  const data = []
  
  // 生成过去7天的模拟数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // 随机生成合理的通过率（75-98%）
    const passRate = Math.floor(Math.random() * 23) + 75
    
    data.push({
      date: dateStr,
      passRate,
      failRate: 100 - passRate
    })
  }
  
  return data
}

async function getTestCaseCount(userId: string) {
  if (!userId) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      other: 0
    }
  }
  
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
  if (!userId) return 0
  
  try {
    const testPlans = await prisma.testPlan.findMany({
      where: {
        createdById: userId,
        // 只获取活跃的测试计划
        status: {
          not: "ARCHIVED"
        }
      },
      include: {
        testCases: {
          select: {
            status: true
          }
        },
      },
    });

    if (testPlans.length === 0) return 0;

    // 计算所有活跃测试计划的平均进度
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
  if (!userId) {
    return getDefaultTestStats();
  }
  
  try {
    // 获取最近30天的数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const testCaseCount = await prisma.testCase.count({
      where: {
        createdById: userId,
      },
    });

    const testExecutions = await prisma.testExecution.findMany({
      where: {
        executedById: userId,
        executedAt: { gte: thirtyDaysAgo }
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
        status: "COMPLETED",
      },
    });

    const automatedTestCount = await prisma.testCase.count({
      where: {
        createdById: userId,
        isAutomated: true
      }
    });

    // 获取关键领域的代码覆盖率
    const codeCoverage = await getCodeCoverage(userId);

    // 修改返回格式以符合图表需求
    return [
      { name: "测试用例总数", value: testCaseCount },
      { name: "成功用例", value: passedTestCaseCount },
      { name: "失败用例", value: failedTestCaseCount },
      { name: "已完成计划", value: completedTestPlanCount },
      { name: "代码覆盖率", value: codeCoverage }
    ];
  } catch (error) {
    console.error("Error fetching test stats:", error);
    return getDefaultTestStats();
  }
}

// 获取默认测试统计数据
function getDefaultTestStats() {
  return [
    { name: "测试用例总数", value: 0 },
    { name: "成功用例", value: 0 },
    { name: "失败用例", value: 0 },
    { name: "已完成计划", value: 0 },
    { name: "代码覆盖率", value: 0 }
  ];
}

// 获取代码覆盖率（模拟数据，实际应从覆盖率服务获取）
async function getCodeCoverage(userId: string): Promise<number> {
  // 此处应该调用实际的代码覆盖率服务
  // 现在先返回模拟数据
  return Math.floor(Math.random() * 20) + 70; // 返回70-90之间的随机值
}

// 获取最近的测试问题
async function getRecentTestIssues(userId: string) {
  if (!userId) return [];
  
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return await prisma.testExecution.findMany({
      where: {
        executedById: userId,
        result: "FAILED",
        executedAt: { gte: lastWeek }
      },
      orderBy: {
        executedAt: 'desc'
      },
      take: 3,
      include: {
        testCase: {
          select: {
            title: true,
            priority: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching recent test issues:', error);
    return [];
  }
}

// 获取工单统计数据
async function getTicketStats(userId: string) {
  if (!userId) {
    return getDefaultTicketStats();
  }
  
  try {
    // 获取用户的工单统计
    const tickets = await prisma.ticket.groupBy({
      by: ['status'],
      where: {
        createdById: userId,
        OR: [
          { status: { notIn: [TicketStatus.LIVE, TicketStatus.PAUSED] } },
          { 
            status: TicketStatus.LIVE, 
            updatedAt: { 
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            } 
          },
          {
            status: TicketStatus.CLOSED,
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        ]
      },
      _count: {
        _all: true
      }
    });

    // 定义状态颜色映射
    const statusColorMap = {
      PENDING: "#ff6384",     // 红色
      SCHEDULED: "#36a2eb",   // 蓝色
      DEVELOPING: "#ffcd56",  // 黄色
      PAUSED: "#4bc0c0",      // 青色
      LIVE: "#9966ff",        // 紫色
      CLOSED: "#ff9f40",      // 橙色
    };

    // 格式化数据以适应图表需要
    const chartData = tickets.map(item => ({
      name: item.status,
      value: item._count._all, // 使用_count._all获取总数
      color: statusColorMap[item.status as keyof typeof statusColorMap] || "#c9cbcf"
    }));

    return chartData.length > 0 ? chartData : getDefaultTicketStats();
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return getDefaultTicketStats();
  }
}

// 获取工单优先级分布
async function getTicketPriorityStats(userId: string) {
  if (!userId) {
    return [];
  }

  try {
    const priorityStats = await prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        createdById: userId, // 将 reporterId 替换为 createdById 或其他实际存在的字段
        OR: [
          { status: { notIn: ["LIVE", "PAUSED"] } },
          {
            status: "LIVE",
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      _count: true,
    });

    // 优先级颜色映射，使用正确的Priority枚举值
    const priorityColorMap = {
      P0: "#ff4d4f", // 红色
      P1: "#faad14", // 黄色
      P2: "#52c41a", // 绿色
      P3: "#1890ff", // 蓝色
    };

    // 格式化数据
    return priorityStats.map((item) => ({
      name: item.priority,
      value: item._count,
      color: priorityColorMap[item.priority as keyof typeof priorityColorMap] || "#c9cbcf",
    }));
  } catch (error) {
    console.error("Error fetching ticket priority stats:", error);
    return [];
  }
}

// 获取最近活动的工单
async function getRecentTickets(userId: string) {
  if (!userId) return [];
  
  try {
    const recentTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { createdById: userId },
          { assignedToId: userId }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        updatedAt: true
      }
    });
    
    return recentTickets.map(ticket => ({
      ...ticket,
      status: ticket.status || "UNKNOWN", // 确保状态字段存在
      priority: ticket.priority || "LOW" // 确保优先级字段存在
    }));
  } catch (error) {
    console.error('Error fetching recent tickets:', error);
    return [];
  }
}

// 获取默认工单统计数据
function getDefaultTicketStats() {
  return [
    { name: "待处理", value: 0, color: "#ff6384" },
    { name: "处理中", value: 0, color: "#36a2eb" },
    { name: "已解决", value: 0, color: "#4bc0c0" }
  ];
}

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  const userId = session?.user?.id || "";
  
  // 并行获取所有数据
  const [
    testCaseCount,
    recentTestCases,
    trendData,
    testStatsData,
    testPlanProgress,
    recentIssues,
    ticketStats,
    ticketPriorityStats,
    recentTickets
  ] = await Promise.all([
    getTestCaseCount(userId),
    getRecentTestCases(userId),
    getTestExecutionStats(userId),
    getTestStats(userId),
    getTestPlanProgress(userId),
    getRecentTestIssues(userId),
    getTicketStats(userId),
    getTicketPriorityStats(userId),
    getRecentTickets(userId)
  ]);

  // 获取当前发布周期
  const releaseDate = getLastReleaseDate();
  const releaseDateStr = releaseDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
