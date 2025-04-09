/** @format */

import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
    return await prisma.testCase.count({
      where: {
        createdById: userId
      }
    })
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return 0
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

    const totalTestCases = testPlans.reduce(
      (sum, plan) => sum + plan.testCases.length,
      0
    );
    const completedTestCases = testPlans.reduce((sum, plan) => {
      return (
        sum + plan.testCases.filter((tc) => tc.status === "COMPLETED").length
      );
    }, 0);

    return totalTestCases > 0
      ? Math.round((completedTestCases / totalTestCases) * 100)
      : 0;
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testCaseCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTestCases.length > 0 ? (
              <ul className="space-y-2">
                {recentTestCases.map((testCase) => (
                  <li key={testCase.id} className="text-sm">
                    {testCase.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent test cases
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trendData.length > 0 && (
          <PassFailTrendChart data={trendData} />
        )}
        <TestPlanProgressChart progress={await getTestPlanProgress(userId)} />
        {testStatsData.length > 0 && (
          <TestStatsChart data={testStatsData} />
        )}
        <SystemHealth />
      </div>
    </div>
  );
}
