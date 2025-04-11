'use client'
import { CreateTicketForm } from '../components/CreateTicketForm'
import { useProject } from '@/components/layout/ProjectSwitcher'

export default function NewTicketPage() {
  const { currentProject } = useProject()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">创建新工单</h1>
      <CreateTicketForm currentProjectId={currentProject?.id} />
    </div>
  )
}
