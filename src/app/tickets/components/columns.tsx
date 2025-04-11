'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Ticket, TicketStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'title',
    header: '标题',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue("status")
      const variantMap: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'success'> = {
        PENDING: 'default',
        SCHEDULED: 'secondary',
        DEVELOPING: 'secondary',
        PAUSED: 'destructive',
        LIVE: 'success'
      }
      const variant = variantMap[status as TicketStatus] || 'default'
      
      const label = {
        PENDING: '待评估',
        SCHEDULED: '已排期',
        DEVELOPING: '研发中',
        PAUSED: '已暂停',
        LIVE: '已上线'
      }[status as string] || status
      
      return <Badge variant={variant}>{String(label)}</Badge>
    },
  },
  {
    accessorKey: 'priority',
    header: '优先级',
    cell: ({ row }) => {
      const priority = row.getValue("priority")
      const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'success'> = {
        P0: 'destructive',
        P1: 'destructive',
        P2: 'default',
        P3: 'secondary'
      }
      const variant = variantMap[priority as keyof typeof variantMap] || 'default'
      
      const label = {
        P0: '紧急 (P0)',
        P1: '高 (P1)',
        P2: '中 (P2)',
        P3: '低 (P3)'
      }[priority as string] || priority
      
      return <Badge variant={variant}>{String(label)}</Badge>
    },
  },
  {
    accessorKey: 'createdBy.name',
    header: '创建人',
  },
  {
    accessorKey: 'assignedTo.name',
    header: '负责人',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ticket = row.original
      return (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/tickets/${ticket.id}`}>查看</Link>
        </Button>
      )
    },
  },
]
