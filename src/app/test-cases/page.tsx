import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { TestCaseList, CreateTestCase } from "./components"

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">测试用例管理</h1>
        <CreateTestCase />
      </div>
      
      <TestCaseList />
    </div>
  )
}
