/** @format */

"use client"
import { useState, useEffect } from "react"
import { useProject } from "@/components/layout/ProjectSwitcher"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { TestCase } from "@prisma/client"
import { EditTestCase } from "./EditTestCase"

export function TestCaseList() {
  const { currentProject } = useProject()
	const [cases, setCases] = useState<TestCase[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchTestCases = async () => {
			try {
				setIsLoading(true)
				const url = currentProject 
					? `/api/test-cases?projectId=${currentProject.id}`
					: '/api/test-cases'
				const response = await fetch(url)
				if (response.ok) {
					setCases(await response.json())
				}
			} catch (error) {
				console.error('Failed to fetch test cases:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchTestCases()
	}, [currentProject?.id])
	const [searchTerm, setSearchTerm] = useState('')
	const [dateFilter, setDateFilter] = useState('')

	const filteredCases = cases.filter(caseItem => {
		const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
							caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesDate = !dateFilter || 
							new Date(caseItem.createdAt).toISOString().split('T')[0] === dateFilter
		return matchesSearch && matchesDate
	})

	const handleDelete = async (id: string) => {
		await fetch(`/api/test-cases/${id}`, {
			method: "DELETE",
		})
		setCases(cases.filter((c) => c.id !== id))
	}

	const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

	const handleStatusChange = async (id: string, newStatus: string) => {
		setUpdatingStatus(id)
		try {
			const response = await fetch(`/api/test-cases`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id, status: newStatus }),
			})
			if (response.ok) {
				setCases(
					cases.map((c) =>
						c.id === id ? { ...c, status: newStatus } : c
					)
				)
			}
		} catch (error) {
			console.error("状态更新失败:", error)
		} finally {
			setUpdatingStatus(null)
		}
	}

	return (
		<div className="space-y-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/dashboard">首页</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href="/test-cases">测试用例</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="flex gap-4">
				<Input
					placeholder="搜索测试用例..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="max-w-sm"
				/>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">
							{dateFilter ? new Date(dateFilter).toLocaleDateString() : "选择日期"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={dateFilter ? new Date(dateFilter) : undefined}
							onSelect={(date) => setDateFilter(date?.toISOString().split('T')[0] || '')}
						/>
					</PopoverContent>
				</Popover>
				{dateFilter && (
					<Button 
						variant="ghost" 
						onClick={() => setDateFilter('')}
					>
						清除日期
					</Button>
				)}
			</div>
			<Card className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
			<div className="relative h-[500px] overflow-auto">
				<Table className="[&_tr:hover]:bg-muted/50 [&_tr]:transition-colors">
					<TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
						<TableRow>
							<TableHead>标题</TableHead>
							<TableHead>优先级</TableHead>
							<TableHead>状态</TableHead>
							<TableHead>创建人</TableHead>
							<TableHead>创建时间</TableHead>
							<TableHead>操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCases.map((testCase) => (
							<TableRow key={testCase.id}>
								<TableCell>{testCase.title}</TableCell>
								<TableCell>
									<Badge
										variant={
											testCase.priority === "P0"
												? "destructive"
												: "secondary"
										}
									>
										{testCase.priority}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant={
											testCase.status === "PASSED"
												? "success"
												: testCase.status === "FAILED"
												? "destructive"
												: "secondary"
										}
										className="capitalize"
									>
										{testCase.status.toLowerCase()}
									</Badge>
								</TableCell>
								<TableCell>{testCase.createdById}</TableCell>
								<TableCell>
									{new Date(testCase.createdAt).toLocaleString()}
								</TableCell>
								<TableCell className="space-x-2">
									<EditTestCase
										testCase={testCase}
										onSuccess={async () => {
											const response = await fetch("/api/test-cases")
											if (response.ok) {
												setCases(await response.json())
											}
										}}
									/>
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="hover:scale-105 transition-transform"
											>
												详情
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
											<DialogHeader>
												<DialogTitle>测试用例详情</DialogTitle>
											</DialogHeader>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
												<div className="md:col-span-1 space-y-4">
													<div>
														<h3 className="font-medium">标题</h3>
														<p>{testCase.title}</p>
													</div>
													<div>
														<h3 className="font-medium">优先级</h3>
														<Badge
															variant={
																testCase.priority === "P0"
																	? "destructive"
																	: "secondary"
															}
														>
															{testCase.priority}
														</Badge>
													</div>
													<div>
														<h3 className="font-medium">状态</h3>
														<Badge
															variant={
																testCase.status === "PASSED"
																	? "success"
																	: testCase.status === "FAILED"
																	? "destructive"
																	: "secondary"
															}
															className="capitalize"
														>
															{testCase.status.toLowerCase()}
														</Badge>
													</div>
													<div>
														<h3 className="font-medium">创建人</h3>
														<p>{testCase.createdById}</p>
													</div>
													<div>
														<h3 className="font-medium">创建时间</h3>
														<p>{new Date(testCase.createdAt).toLocaleString()}</p>
													</div>
												</div>
												<div className="md:col-span-2 space-y-4">
													<div>
														<h3 className="font-medium">描述</h3>
														<div className="prose max-h-40 overflow-y-auto p-2 border rounded">
															<ReactMarkdown remarkPlugins={[remarkGfm]}>
																{testCase.description || "无描述"}
															</ReactMarkdown>
														</div>
													</div>
													<div>
														<h3 className="font-medium">测试步骤</h3>
														<div className="prose max-h-40 overflow-y-auto p-2 border rounded">
															<ReactMarkdown remarkPlugins={[remarkGfm]}>
																{testCase.steps || "无测试步骤"}
															</ReactMarkdown>
														</div>
													</div>
													<div>
														<h3 className="font-medium">预期结果</h3>
														<div className="prose max-h-40 overflow-y-auto p-2 border rounded">
															<ReactMarkdown remarkPlugins={[remarkGfm]}>
																{testCase.expected || "无预期结果"}
															</ReactMarkdown>
														</div>
													</div>
												</div>
											</div>
										</DialogContent>
									</Dialog>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant={testCase.status === "PASSED" ? "outline" : "default"}
												size="sm"
												className="hover:scale-105 transition-transform"
												disabled={updatingStatus === testCase.id}
											>
												{updatingStatus === testCase.id ? (
													"处理中..."
												) : (
													testCase.status === "PASSED" ? "标记失败" : "标记通过"
												)}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>确认操作</AlertDialogTitle>
												<AlertDialogDescription>
													确定要将测试用例标记为{testCase.status === "PASSED" ? "失败" : "通过"}吗?
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>取消</AlertDialogCancel>
												<AlertDialogAction 
													onClick={() => handleStatusChange(
														testCase.id, 
														testCase.status === "PASSED" ? "FAILED" : "PASSED"
													)}
												>
													确认
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
									<Button
										variant="destructive"
										size="sm"
										className="hover:scale-105 transition-transform"
										onClick={() => handleDelete(testCase.id)}
									>
										删除
									</Button>
									{/* <Button
										variant="secondary"
										size="sm"
										className="hover:scale-105 transition-transform"
										onClick={async () => {
											const response = await fetch('/api/test-cases/seed', {
												method: 'POST'
											})
											if (response.ok) {
												const data = await response.json()
												setCases(data)
											}
										}}
									>
										生成测试数据
									</Button> */}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			</Card>
		</div>
	)
}
