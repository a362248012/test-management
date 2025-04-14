import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { BugList, CreateBug } from "./components"

export default async function BugsPage() {
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
        <h1 className="text-2xl font-bold">缺陷管理</h1>
        <CreateBug />
      </div>
      
      <BugList />
    </div>
  )
}
