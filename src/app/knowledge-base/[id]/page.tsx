import KnowledgeDetail from '@/components/knowledge/KnowledgeDetail'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth'

async function getKnowledge(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/knowledge-base?id=${id}`)
  if (!res.ok) return null
  return res.json()
}

export default async function KnowledgeDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authConfig)
  const knowledge = await getKnowledge(params.id)

  if (!knowledge) {
    return notFound()
  }

  // 检查权限：公开或自己的知识
  if (!knowledge.isPublic && knowledge.createdById !== session?.user?.id) {
    return notFound()
  }

  return <KnowledgeDetail knowledge={knowledge} />
}
