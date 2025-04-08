/** @format */

"use client"
import { signIn } from "next-auth/react"
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { FlickeringGrid } from "@/components/ui/flickering-grid"

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 relative">
			<FlickeringGrid
				className="z-0 absolute inset-0 size-full"
				squareSize={4}
				gridGap={6}
				color="#6B7280"
				maxOpacity={0.5}
				flickerChance={0.1}
			/>
			<Card className="w-full max-w-sm shadow-lg z-1">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl text-center">账户登录</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => signIn("github")}
					>
						<Github className="mr-2 h-4 w-4" />
						使用 GitHub 登录
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								或
							</span>
						</div>
					</div>

					<form
						className="space-y-4"
						onSubmit={async (e) => {
							e.preventDefault()
							const formData = new FormData(e.currentTarget)
							const email = e.currentTarget.email.value
							const password = e.currentTarget.password.value
							const credentials = {
								email: email || "",
								password: password || "",
							}

							console.log("提交的凭证:", credentials)

							try {
								console.log("尝试登录:", credentials)
								const result = await signIn("credentials", {
									...credentials,
									redirect: false,
								})

								console.log("登录结果:", result)

								if (result?.error) {
									console.error("登录错误详情:", result.error)
									throw new Error(result.error)
								}

								if (result?.ok) {
									console.log("登录成功，重定向到首页")
									// 添加延迟确保cookie设置完成
									setTimeout(() => {
										window.location.href = "/"
									}, 500)
									return
								}
							} catch (error) {
								console.error("登录捕获错误:", error)
								alert(error instanceof Error ? error.message : "登录失败")
							}
						}}
					>
						<div className="space-y-2">
							<Label htmlFor="email">邮箱</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								defaultValue="a1234@163.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">密码</Label>
							<Input
								id="password"
								type="password"
								placeholder="请输入密码"
								defaultValue="123456"
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full cursor-pointer"
							disabled={false} // 设置为 true 时禁用按钮
						>
							<Mail className="mr-2 h-4 w-4" />
							邮箱登录
							{/* 可添加 <Loader2 className="ml-2 h-4 w-4 animate-spin" /> 需要从 lucide-react 导入 */}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="flex flex-col items-center text-sm text-muted-foreground space-y-2">
					<div>点击登录即表示同意我们的服务条款</div>
					<Separator className="w-1/2" />
					<div className="text-xs">v1.0.0</div>
				</CardFooter>
				{/* 去注册 */}
				<div className="text-center text-sm text-blue-500 hover:underline cursor-pointer">
					还没有账户？<a href="/register">注册</a>
				</div>
			</Card>
		</div>
	)
}
