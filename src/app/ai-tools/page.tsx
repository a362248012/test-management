/** @format */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { useSession } from "next-auth/react"
import { marked } from "marked"

export default function AIToolsPage() {
	const { data: session } = useSession()
	const [requirement, setRequirement] = useState("")
	const [isGenerating, setIsGenerating] = useState(false)
	const [testCases, setTestCases] = useState("")
	const [error, setError] = useState("")

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
		<div className="flex flex-col h-full">
			<h1 className="text-2xl font-bold mb-6">AI 测试工具</h1>

			<div className="flex-1 flex flex-col gap-6">
				<div className="flex-1 flex flex-col gap-2">
					<Label>生成的测试用例</Label>
					<div
						className="flex-1 p-4 bg-gray-50 rounded-md h-[300px] overflow-auto prose"
						dangerouslySetInnerHTML={{
							__html: marked.parse(
								testCases ||
									'<p class="text-gray-400">生成的测试用例将显示在这里</p>'
							),
						}}
					/>
					{testCases && (
						<Button
							variant="outline"
							className="w-full"
							onClick={() => navigator.clipboard.writeText(testCases)}
						>
							复制到剪贴板
						</Button>
					)}
				</div>
				<div className="space-y-2">
					<Label>需求描述</Label>
					<Textarea
						placeholder="输入需求描述或用户故事..."
						value={requirement}
						onChange={(e: any) => setRequirement(e.target.value)}
						className="min-h-[200px]"
					/>
					{error && <p className="text-red-500 text-sm">{error}</p>}
				</div>

				<Button
					onClick={handleGenerate}
					disabled={isGenerating}
					className="w-full"
				>
					{isGenerating ? "生成中..." : "生成测试用例"}
				</Button>
			</div>
		</div>
	)
}
