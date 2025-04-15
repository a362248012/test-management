/** @format */

"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"
import { type Session } from "next-auth"
import ProjectSwitcher from "./ProjectSwitcher"
import { signOut } from "next-auth/react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuGroups = [
	{
		title: "核心功能",
		items: [{ name: "仪表盘", path: "/dashboard", icon: "/window.svg" }],
	},
	{
		title: "测试管理",
		items: [
			{ name: "工单管理", path: "/tickets", icon: "/file.svg" },
			{ name: "测试用例", path: "/test-cases", icon: "/file.svg" },
			// { name: "测试计划", path: "/test-plans", icon: "/file.svg" },
			// { name: "测试执行", path: "/test-executions", icon: "/file.svg" },
			{ name: "缺陷管理", path: "/bugs", icon: "/file.svg" },
		],
	},
	{
		title: "分析工具",
		items: [
			{ name: "AI 测试工具", path: "/ai-tools", icon: "/globe.svg" },
			{ name: "知识库", path: "/knowledge-base", icon: "/globe.svg" },
		],
	},
	{
		title: "系统管理",
		items: [{ name: "用户管理", path: "/admin/users", icon: "/window.svg" }],
	},
]

import { ProjectProvider } from "./ProjectSwitcher"

function SidebarContent({
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
			<nav className="flex items-center justify-between p-4 border-b bg-muted/50">
				<div className="flex items-center gap-4">
					<Image
						src="/hina-logo.png"
						alt="Hina Logo"
						width={200}
						height={48}
						priority
					/>
				</div>

				<div className="flex items-center gap-4">
					<ThemeToggle />
					{session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="gap-2 btn">
									<span className="font-medium">{session.user.email}</span>
									<Avatar>
										{session.user.image ? (
											<Image
												src={session.user.image}
												alt="User Avatar"
												width={40}
												height={40}
												className="rounded-full"
											/>
										) : (
											<AvatarFallback>
												{session.user.email?.charAt(0).toUpperCase()}
											</AvatarFallback>
										)}
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
				</div>
			</nav>

			<div className="flex flex-1">
				{/* 左侧边栏菜单 */}
				<div className="w-64 border-r p-4 space-y-6 bg-muted/30">
					<ProjectSwitcher />
					{menuGroups.map((group) => (
						<div key={group.title} className="space-y-2">
							<h3 className="px-4 text-sm font-medium text-muted-foreground">
								{group.title}
							</h3>
							<div className="space-y-1">
								{group.items.map((item) => (
									<Button
										key={item.path}
										variant={activePath === item.path ? "default" : "ghost"}
										className="w-full justify-start sidebar-item gap-2"
										onClick={() => {
											setActivePath(item.path)
											router.push(item.path)
										}}
									>
										<Image
											src={item.icon}
											alt=""
											width={16}
											height={16}
											className="opacity-70"
										/>
										{item.name}
									</Button>
								))}
							</div>
						</div>
					))}
				</div>

				{/* 主内容区 */}
				<div className="flex-1 p-8 overflow-auto">{children}</div>
			</div>
    </div>
  )
}

export default function SidebarLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode
  session: Session | null
}>) {
  return (
    <ProjectProvider>
      <SidebarContent session={session}>
        {children}
      </SidebarContent>
    </ProjectProvider>
  )
}
