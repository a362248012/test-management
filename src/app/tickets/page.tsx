'use client'
import { useEffect, useState } from 'react'
import { Ticket } from '@prisma/client'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useProject } from '@/components/layout/ProjectSwitcher'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const { currentProject } = useProject()

  useEffect(() => {
    const url = currentProject 
      ? `/api/tickets?projectId=${currentProject.id}`
      : '/api/tickets'
      
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => setTickets(data))
      .catch(error => {
        console.error('获取工单失败:', error)
        setTickets([])
      })
  }, [currentProject?.id])

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工单管理</h1>
        <Button asChild>
          <Link href="/tickets/new">新建工单</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={tickets} />
    </div>
  )
}
