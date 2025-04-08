import { getServerSession, type Session } from 'next-auth'
import { authConfig } from '@/auth'
import SidebarLayout from '@/components/layout/SidebarLayout'

export default async function TestPlansPage() {
  const session = (await getServerSession(authConfig)) as Session

  return (
    <SidebarLayout session={session}>
      <div>
        <h1>测试计划</h1>
        <p>这里是测试计划管理页面</p>
      </div>
    </SidebarLayout>
  )
}
