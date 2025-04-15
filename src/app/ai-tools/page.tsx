/** @format */

"use client"

import { useState } from "react"
import { AIGenerateTestPlans } from "@/app/test-plans/components/AIGenerateTestPlans"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { marked } from "marked"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestAnalysisPage from "./test-analysis/page"
 import {AIGenerateTestCases} from "@/app/test-plans/components/AIGenerateTestCases"


const AI_TOOLS = [
  { id: "test-cases", label: "测试用例生成" },
  { id: "test-plans", label: "测试计划生成" },
  { id: "test-analysis", label: "测试数据分析" },
  { id: "execution-analysis", label: "执行结果分析" },
  { id: "defect-prediction", label: "缺陷预测" },
  { id: "coverage-optimization", label: "覆盖率优化" }
] as const

export default function AIToolsPage() {
	const { data: session } = useSession()
	const [activeTool, setActiveTool] = useState<typeof AI_TOOLS[number]['id']>("test-cases")
	const [requirement, setRequirement] = useState("")
	const [isGenerating, setIsGenerating] = useState(false)
	const [testCases, setTestCases] = useState("")
	const [error, setError] = useState("")
	const [modificationRequest, setModificationRequest] = useState("")

	const handleGenerate = async () => {
		if (!requirement.trim()) {
			setError("请输入需求描述")
			return
		}

		setIsGenerating(true)
		setError("")
		setTestCases("")

		try {
			const response = await fetch("/api/ai/generate-test-cases", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ requirement }),
			})

			if (!response.ok) {
				throw new Error("生成失败")
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error("无法读取响应流")
			}

			const decoder = new TextDecoder()
			let result = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				const chunk = decoder.decode(value)
				result += chunk
				setTestCases((prev) => prev + chunk)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "请求失败")
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="flex flex-col h-full p-8">
			<h1 className="text-2xl font-bold mb-4">AI 测试工具</h1>

				<Tabs 
					value={activeTool}
					onValueChange={(value) => {
						console.log('Tab changed to:', value);
						setActiveTool(value);
					}}
					defaultValue="test-cases"
					className="w-full mb-6"
				>
				<TabsList className="grid w-full grid-cols-6">
					{AI_TOOLS.map((tool) => (
						<TabsTrigger key={tool.id} value={tool.id}>
							{tool.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="flex-1 flex flex-col gap-6">
				{activeTool === "test-cases" && (
					<AIGenerateTestCases />
				)}

				{activeTool === "test-plans" && (
					<div className="flex-1 flex flex-col gap-4">
						<AIGenerateTestPlans />
					</div>
				)}

				{activeTool === "execution-analysis" && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-500">测试执行结果分析功能开发中</p>
					</div>
				)}

				{activeTool === "defect-prediction" && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-500">缺陷预测功能开发中</p>
					</div>
				)}

				{activeTool === "test-analysis" && (
					<div className="flex-1">
						<TestAnalysisPage />
					</div>
				)}

				{activeTool === "coverage-optimization" && (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-500">测试覆盖率优化功能开发中</p>
					</div>
				)}
			</div>
		</div>
	)
}
