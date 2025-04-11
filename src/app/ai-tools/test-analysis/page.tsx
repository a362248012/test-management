"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Priority } from "@prisma/client"
import { DateRange } from "react-day-picker"

export default function TestAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange,
          priorities
        })
      })
      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error('分析失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const priorityOptions: Priority[] = ['P0', 'P1', 'P2', 'P3']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI测试用例分析</h1>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">时间范围</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {dateRange?.from ? 
                    `${dateRange.from.toLocaleDateString()} ~ ${dateRange.to?.toLocaleDateString() || ''}` : 
                    '选择日期范围'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <h3 className="font-medium mb-2">优先级筛选</h3>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(priority => (
                <Badge
                  key={priority}
                  variant={priorities.includes(priority) ? "default" : "secondary"}
                  onClick={() => setPriorities(prev => 
                    prev.includes(priority) ? 
                    prev.filter(p => p !== priority) : 
                    [...prev, priority]
                  )}
                  className="cursor-pointer"
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '分析中...' : '开始分析'}
            </Button>
          </div>
        </div>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">数据分析结果</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-medium">测试用例总数</h3>
                <p className="text-3xl font-bold">{analysisResult.totalCases}</p>
              </div>
              
              <div className="border rounded p-4">
                <h3 className="font-medium">优先级分布</h3>
                <div className="space-y-2 mt-2">
                  {Object.entries(analysisResult.priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center gap-2">
                      <Badge variant="secondary">{priority}</Badge>
                      <span>{count as number}个</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-medium">常见失败用例</h3>
                <div className="space-y-2 mt-2">
                  {analysisResult.failurePatterns
                    .sort((a: any, b: any) => b.failureCount - a.failureCount)
                    .slice(0, 3)
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="truncate">{item.title}</span>
                        <Badge variant="destructive">{item.failureCount}次失败</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI分析建议</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap">{analysisResult.aiAnalysis}</pre>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
