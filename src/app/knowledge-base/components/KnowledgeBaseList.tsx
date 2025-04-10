'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface KnowledgeItem {
  id: string
  title: string
  category: string
  createdAt: string
  createdBy: {
    name: string | null
  }
}

export default function KnowledgeBaseList() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await fetch('/api/knowledge-base')
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setKnowledge(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch knowledge:', error)
        setKnowledge([])
      } finally {
        setLoading(false)
      }
    }

    fetchKnowledge()
  }, [])

  const filteredKnowledge = knowledge.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>知识库列表</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="搜索知识..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button asChild>
            <Link href="/knowledge-base/new">新建知识</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>创建人</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKnowledge.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.createdBy.name || '未知'}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="link" asChild>
                    <Link href={`/knowledge-base/${item.id}`}>查看</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
