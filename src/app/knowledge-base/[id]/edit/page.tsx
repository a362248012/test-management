import KnowledgeForm from '@/components/knowledge/KnowledgeForm'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth'

async function getKnowledge(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/knowledge-base?id=${id}`)
  if (!res.ok) return null
  return res.json()
}

export default async function KnowledgeEditPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authConfig)
  const knowledge = await getKnowledge(params.id)

  if (!knowledge) {
    return notFound()
  }

  // 检查权限：只有创建者可以编辑
  if (knowledge.createdById !== session?.user?.id) {
    return notFound()
  }

  return <KnowledgeForm knowledge={knowledge} />
}
