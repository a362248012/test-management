'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface KnowledgeDetailProps {
  knowledge: {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    isPublic: boolean
    createdAt: string
    updatedAt: string
    createdBy: {
      name: string | null
      email: string
    }
  }
}

export default function KnowledgeDetail({ knowledge }: KnowledgeDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{knowledge.title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/knowledge-base/${knowledge.id}/edit`}>编辑</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{knowledge.category}</Badge>
            <Badge variant={knowledge.isPublic ? 'default' : 'secondary'}>
              {knowledge.isPublic ? '公开' : '私有'}
            </Badge>
            <div className="text-sm text-gray-500">
              创建于: {format(new Date(knowledge.createdAt), 'yyyy-MM-dd HH:mm')}
            </div>
            <div className="text-sm text-gray-500">
              更新于: {format(new Date(knowledge.updatedAt), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>

          <div className="flex gap-2">
            {knowledge.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{knowledge.content}</pre>
          </div>

          <div className="text-sm text-gray-500">
            创建人: {knowledge.createdBy.name || knowledge.createdBy.email}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
