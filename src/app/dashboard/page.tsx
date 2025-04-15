/** @format */

import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">测试仪表板</h1>
        <Badge variant="secondary" className="text-sm">
          当前发布周期: {releaseDateStr}
        </Badge>
      </div>
      
      {!userId && (
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>需要登录</AlertTitle>
          <AlertDescription>
            请登录以查看您的个人测试仪表板数据。
          </AlertDescription>
        </Alert>
      )}

      {/* 第一行卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测试用例总览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testCaseCount.total}</div>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                <span>通过: {testCaseCount.passed}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                <span>失败: {testCaseCount.failed}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-gray-500 mr-1"></span>
                <span>其他: {testCaseCount.other}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              最近测试用例
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTestCases.length > 0 ? (
              <ul className="space-y-2">
                {recentTestCases.map((testCase) => (
                  <li key={testCase.id} className="text-sm flex justify-between">
                    <span className="truncate max-w-[70%]">{testCase.title}</span>
                    <Badge 
                      variant={testCase.status === "PASSED" ? "success" : 
                             testCase.status === "FAILED" ? "destructive" : "secondary"}
                    >
                      {testCase.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {userId ? "本周期暂无测试用例" : "请登录查看测试用例"}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测试计划进度</CardTitle>
          </CardHeader>
          <CardContent>
            <TestPlanProgressChartWrapper progress={testPlanProgress} />
            <p className="text-sm mt-2 text-center">
              {testPlanProgress > 0 
                ? `当前进度: ${testPlanProgress}%` 
                : "暂无活跃测试计划"}
            </p>
          </CardContent>
        </Card>
        
        {/* 替换原第四个卡片为工单统计 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">工单概览</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <ul className="space-y-2">
                {recentTickets.map((ticket) => (
                  <li key={ticket.id} className="text-sm flex justify-between">
                    <span className="truncate max-w-[70%]">{ticket.title}</span>
                    <Badge 
                      variant={ticket.priority === "P0" ? "destructive" : 
                             ticket.priority === "P1" ? "default" : "secondary"}
                    >
                      {ticket.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {userId ? "暂无活跃工单" : "请登录查看工单"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 测试问题卡片单独一行展示 */}
      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">需要关注的问题</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIssues.length > 0 ? (
              <ul className="space-y-2">
                {recentIssues.map((issue) => (
                  <li key={issue.id} className="text-sm">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-1">
                        {issue.testCase.priority}
                      </Badge>
                      <span className="truncate">{issue.testCase.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {userId ? "近期无失败测试" : "请登录查看测试问题"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>通过/失败趋势</CardTitle>
                <CardDescription>最近30天的测试执行结果趋势</CardDescription>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <PassFailTrendChartWrapper data={trendData} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>测试统计</CardTitle>
                <CardDescription>测试执行和覆盖率指标</CardDescription>
              </CardHeader>
              <CardContent>
                {testStatsData.length > 0 ? (
                  <TestStatsChartWrapper data={testStatsData} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <SystemHealth />
        </div>

        <div className="space-y-6">
          {/* 工单状态饼图 */}
          <Card>
            <CardHeader>
              <CardTitle>工单状态分布</CardTitle>
              <CardDescription>当前工单状态分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketStats.length > 0 ? (
                <TicketStatusChartWrapper data={ticketStats} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 工单优先级饼图 */}
          <Card>
            <CardHeader>
              <CardTitle>工单优先级分布</CardTitle>
              <CardDescription>当前工单优先级分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketPriorityStats.length > 0 ? (
                <TicketStatusChartWrapper data={ticketPriorityStats} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
