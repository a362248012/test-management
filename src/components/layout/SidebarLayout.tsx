/** @format */

"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, ChevronDownIcon, FolderIcon, PlusCircleIcon, SettingsIcon, LogOutIcon, MoreVerticalIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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
import React from "react"

interface SidebarContentProps {
  children: React.ReactNode;
  session: Session | null;
}

function SidebarContent({ children, session }: SidebarContentProps) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState("/");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setActivePath(pathname || "/");
  }, [pathname]);

  return (
    <div className="flex h-screen">
      <div className={`relative bg-card transition-all duration-300 ease-in-out ${expanded ? "w-64" : "w-20"} border-r shadow-sm`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {expanded ? (
              <div className="flex items-center gap-2">
                <Image src="/hina-logo.png" alt="Logo" width={32} height={32} />
                <h2 className="font-semibold text-xl">测试平台</h2>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="rounded-full h-8 w-8"
            >
              {expanded ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-4 px-2">
            <nav className="space-y-2">
              {menuGroups.map((group) => (
                <div key={group.title} className="space-y-2 mb-6">
                  {expanded && (
                    <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={cn(
                          "group flex items-center px-3 py-2 rounded-md transition-all duration-200",
                          "hover:bg-accent/50 hover:translate-x-1",
                          activePath === item.path
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-md">
                          <Image src={item.icon} alt={item.name} width={20} height={20} />
                        </div>
                        {expanded && <span>{item.name}</span>}
                        {!expanded && (
                          <span className="absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-sm opacity-0 shadow-md group-hover:opacity-100 transition-opacity duration-200">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Project Selection - 保留项目选择功能 */}
          <div className={`px-3 py-2 border-t ${expanded ? "" : "flex justify-center"}`}>
            {expanded ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">当前项目</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <FolderIcon className="mr-2 h-4 w-4" />
                      <span className="truncate">测试平台项目</span>
                      <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>切换项目</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <FolderIcon className="mr-2 h-4 w-4" /> 测试平台项目
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderIcon className="mr-2 h-4 w-4" /> 项目 A
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderIcon className="mr-2 h-4 w-4" /> 项目 B
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PlusCircleIcon className="mr-2 h-4 w-4" /> 创建新项目
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <FolderIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">切换项目</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* User section - 保留用户退出功能 */}
          {expanded ? (
            <div className="p-4 border-t">
              {session?.user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <Avatar>
                        <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                        <AvatarFallback>{(session.user.name || "User")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar>
                        <AvatarFallback>{(session.user.name || "User")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{session.user.name || "用户"}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{session.user.email}</span>
                    </div>
                  </div>
                  {/* 退出功能 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" /> 个人资料
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="mr-2 h-4 w-4" /> 设置
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOutIcon className="mr-2 h-4 w-4" /> 退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/login" className="w-full">
                  <Button className="w-full">登录</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="p-4 border-t flex justify-center">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                      ) : (
                        <AvatarFallback>{(session.user.name || "User")[0].toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" /> 个人资料
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIcon className="mr-2 h-4 w-4" /> 设置
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOutIcon className="mr-2 h-4 w-4" /> 退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      <main className="flex-1 overflow-auto page-transition p-8">
        {children}
      </main>
    </div>
  );
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
