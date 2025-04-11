'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { Ticket } from '@prisma/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateTicketForm } from '@/app/tickets/components/CreateTicketForm'

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetch(`/api/tickets?id=${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => setTicket(data))
  }, [resolvedParams.id])

  if (!ticket) return <div>加载中...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工单详情</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '取消编辑' : '编辑工单'}
          </Button>
          <Button asChild>
            <Link href="/tickets">返回列表</Link>
          </Button>
        </div>
      </div>

      {isEditing ? (
        <CreateTicketForm 
          initialData={{
            title: ticket.title,
            description: ticket.description || '',
            status: ticket.status,
            priority: ticket.priority,
            assignedToId: ticket.assignedToId
          }}
          onSuccess={() => {
            setIsEditing(false)
            fetch(`/api/tickets?id=${resolvedParams.id}`)
              .then(res => res.json())
              .then(data => setTicket(data))
          }}
          isEditMode={true}
          ticketId={ticket.id}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">基本信息</h2>
              <p><span className="font-medium">标题:</span> {ticket.title}</p>
              <p><span className="font-medium">状态:</span> {ticket.status}</p>
              <p><span className="font-medium">优先级:</span> {ticket.priority}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">描述</h2>
              <p>{ticket.description || '暂无描述'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
