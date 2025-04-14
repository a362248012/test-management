'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { Ticket } from '@prisma/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateTicketForm } from '@/app/tickets/components/CreateTicketForm'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { EnhancedCard } from '@/components/ui/card'
import { XCircleIcon } from '@heroicons/react/solid'
import { Badge } from '@/components/ui/badge'
import { FileIcon } from '@heroicons/react/outline'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/utils/formatDate'
import { getStatusVariant, getPriorityVariant } from '@/utils/variants'

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(`/api/tickets?id=${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setTicket(data)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err)
        setIsLoading(false)
      })
  }, [resolvedParams.id])

  return (
    <div className="container py-8 page-transition">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/tickets">工单</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{ticket?.title || "工单详情"}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : error ? (
        <EnhancedCard 
          className="max-w-lg mx-auto text-center p-6"
          borderStyle="accent"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <XCircleIcon className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-medium">加载失败</h3>
            <p className="text-muted-foreground">{error.message || "无法加载工单详情，请稍后再试。"}</p>
            <Button variant="outline" onClick={() => router.push("/tickets")}>
              返回工单列表
            </Button>
          </div>
        </EnhancedCard>
      ) : ticket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            <EnhancedCard>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
                </div>
                
                <div className="border-t pt-4">
                  <div className="prose max-w-none dark:prose-invert">
                    {ticket.description}
                  </div>
                </div>
                
                {ticket.attachments?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">附件</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ticket.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-2 flex flex-col gap-2 hover:bg-muted/50 transition-colors"
                        >
                          <div className="bg-muted aspect-video rounded flex items-center justify-center">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="truncate text-sm">{attachment.name}</div>
                          <Button size="sm" variant="outline" className="w-full">下载</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </EnhancedCard>
            
            <EnhancedCard title="评论">
              <div className="space-y-4">
                {ticket.comments?.length > 0 ? (
                  ticket.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{comment.user.name}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</div>
                        </div>
                        <div className="mt-1 text-sm">{comment.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    暂无评论
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <Textarea placeholder="添加评论..." className="min-h-32 resize-none" />
                  <div className="flex justify-end mt-2">
                    <Button>提交评论</Button>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
          
          {/* 侧边信息 */}
          <div className="space-y-6">
            <EnhancedCard title="工单信息" borderStyle="accent">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">状态:</span>
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">优先级:</span>
                  <Badge variant={getPriorityVariant(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">创建时间:</span>
                  <span className="text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">更新时间:</span>
                  <span className="text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">预计完成:</span>
                  <span className="text-muted-foreground">{formatDate(ticket.dueDate)}</span>
                </div>
              </div>
            </EnhancedCard>
            
            <EnhancedCard title="相关人员">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-20">创建人:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ticket.reporter?.avatar} />
                      <AvatarFallback>{ticket.reporter?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{ticket.reporter?.name || "未指定"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-20">负责人:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ticket.assignee?.avatar} />
                      <AvatarFallback>{ticket.assignee?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{ticket.assignee?.name || "未指定"}</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>
            
            <EnhancedCard>
              <div className="space-y-3">
                <Button className="w-full" variant="soft">编辑工单</Button>
                <Button className="w-full" variant="outline">分配工单</Button>
                <Button className="w-full" variant="destructive">关闭工单</Button>
              </div>
            </EnhancedCard>
          </div>
        </div>
      ) : null}
    </div>
  )
}
