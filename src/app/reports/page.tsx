import { getServerSession, type Session } from 'next-auth'
import { authConfig } from '@/auth'
import SidebarLayout from '@/components/layout/SidebarLayout'

export default async function ReportsPage() {
  const session = (await getServerSession(authConfig)) as Session

  return (
    <SidebarLayout session={session}>
      <div>
        <h1>测试报告</h1>
        <p>这里是测试报告查看页面</p>
      </div>
    </SidebarLayout>
  )
}
