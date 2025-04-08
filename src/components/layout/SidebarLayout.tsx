/** @format */

"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { type Session } from "next-auth"
import { signOut } from "next-auth/react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuItems = [
	{ name: "仪表盘", path: "/dashboard" },
	{ name: "测试用例", path: "/test-cases" },
	{ name: "测试计划", path: "/test-plans" },
	{ name: "测试执行", path: "/test-executions" },
	{ name: "报告", path: "/reports" },
	{ name: "用户管理", path: "/admin/users" },
]

export default function SidebarLayout({
	children,
	session,
}: Readonly<{
	children: React.ReactNode
	session: Session | null
}>) {
	const pathname = usePathname()
	const router = useRouter()
	const [activePath, setActivePath] = useState(pathname || "/")

	useEffect(() => {
		setActivePath(pathname || "/")
	}, [pathname])

	return (
		<div className="min-h-screen flex flex-col">
			{/* 顶部导航栏 - 仅保留logo和用户信息 */}
			<nav className="flex items-center justify-between p-4 border-b">
				<div className="flex items-center gap-4">
					<Image
						src="/next.svg"
						alt="Next.js Logo"
						width={100}
						height={24}
						priority
					/>
				</div>

				{session?.user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="gap-2">
								<span className="font-medium">{session.user.email}</span>
								<Avatar>
									<AvatarFallback>
										{session.user.email?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={async () => {
									await signOut()
									window.location.href = "/login"
								}}
							>
								退出登录
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button asChild>
						<Link href="/login">登录</Link>
					</Button>
				)}
			</nav>

			<div className="flex flex-1">
				{/* 左侧边栏菜单 */}
				<div className="w-64 border-r p-4 space-y-2">
					{menuItems.map((item) => (
						<Button
							key={item.path}
							variant={activePath === item.path ? "default" : "ghost"}
							className="w-full justify-start"
							onClick={() => {
								setActivePath(item.path)
								router.push(item.path)
							}}
						>
							{item.name}
						</Button>
					))}
				</div>

				{/* 主内容区 */}
				<div className="flex-1 p-8 overflow-auto">{children}</div>
			</div>
		</div>
	)
}
