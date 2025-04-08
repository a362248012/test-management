/** @format */

import { getServerSession, type Session } from "next-auth"
import { authConfig } from "@/auth"
import SidebarLayout from "@/components/layout/SidebarLayout"

export default async function TestCasesPage() {
	const session = (await getServerSession(authConfig)) as Session

	return (
		<div>
			<h1>测试用例</h1>
			<p>这里是测试用例管理页面</p>
		</div>
	)
}
