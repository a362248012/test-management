import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TestExecutionList } from "./components/TestExecutionList";

export default async function TestExecutionsPage() {
  const session = await getServerSession(authConfig);
  if (!session) return null;

  const executions = await prisma.testExecution.findMany({
    include: {
      testPlan: true,
      testCase: true,
      executedBy: true
    },
    orderBy: {
      executedAt: "desc"
    }
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">测试执行记录</h1>
      </div>
      <TestExecutionList executions={executions} />
    </div>
  );
}
