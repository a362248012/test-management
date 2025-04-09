import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { TestCaseList, CreateTestCase } from "./components"
import { prisma } from "@/lib/prisma"

export default async function TestCasesPage() {
  const session = await getServerSession(authConfig) as {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
  }
  
  if (!session) {
    return <div>请先登录</div>
  }

  const testCases = await prisma.testCase.findMany({
    where: {
      createdById: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">测试用例管理</h1>
        <CreateTestCase />
      </div>
      
      <TestCaseList testCases={testCases} />
    </div>
  )
}
