/** @format */

import { getServerSession, type Session } from "next-auth"
import { authConfig } from "@/auth"
import SidebarLayout from "@/components/layout/SidebarLayout"

export default async function DashboardPage() {
	const session = (await getServerSession(authConfig)) as Session

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome to the dashboard</p>
		</div>
	)
}
