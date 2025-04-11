'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Priority, TicketStatus } from '@prisma/client'

interface CreateTicketFormProps {
  initialData?: {
    title: string
    description: string
    status: TicketStatus
    priority: Priority
    assignedToId: string | null
    projectId?: string
  }
  onSuccess?: () => void
  isEditMode?: boolean
  ticketId?: string
  currentProjectId?: string
}

export function CreateTicketForm({
  initialData,
  onSuccess,
  isEditMode = false,
  ticketId,
  currentProjectId
}: CreateTicketFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'OPEN' as TicketStatus,
    priority: initialData?.priority || 'P2' as Priority,
    assignedToId: initialData?.assignedToId || null,
    projectId: initialData?.projectId || currentProjectId || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = isEditMode ? `/api/tickets?id=${ticketId}` : '/api/tickets'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const requestData = isEditMode 
        ? { ...formData, id: ticketId }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/tickets')
        }
      } else {
        const errorData = await response.json()
        alert(`创建失败: ${errorData.error}\n${errorData.details || ''}`)
      }
    } catch (error) {
      alert('请求发送失败，请检查网络连接')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block mb-1 font-medium">标题</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">描述</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">状态</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({...formData, status: value as TicketStatus})}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">待评估</SelectItem>
              <SelectItem value="SCHEDULED">已排期</SelectItem>
              <SelectItem value="DEVELOPING">研发中</SelectItem>
              <SelectItem value="PAUSED">已暂停</SelectItem>
              <SelectItem value="LIVE">已上线</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-1 font-medium">优先级</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({...formData, priority: value as Priority})}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P0">紧急 (P0)</SelectItem>
              <SelectItem value="P1">高 (P1)</SelectItem>
              <SelectItem value="P2">中 (P2)</SelectItem>
              <SelectItem value="P3">低 (P3)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/tickets')}
        >
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : isEditMode ? '更新工单' : '创建工单'}
        </Button>
      </div>
    </form>
  )
}
