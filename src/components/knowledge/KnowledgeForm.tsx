'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type FormValues = {
  title: string
  content: string 
  category: string
  tags: string
  isPublic: boolean
}

const formSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  category: z.string().min(1, '分类不能为空'),
  tags: z.string(),
  isPublic: z.boolean(),
}).required()

interface KnowledgeFormProps {
  knowledge?: {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    isPublic: boolean
  }
}

export default function KnowledgeForm({ knowledge }: KnowledgeFormProps) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: knowledge?.title || '',
      content: knowledge?.content || '',
      category: knowledge?.category || '',
      tags: knowledge?.tags.join(',') || '',
      isPublic: knowledge?.isPublic || false,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
      
      const data = {
        ...values,
        tags,
      }

      const url = knowledge?.id 
        ? `/api/knowledge-base?id=${knowledge.id}`
        : '/api/knowledge-base'
      
      const method = knowledge?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      toast.success('保存成功', {
        description: knowledge?.id ? '知识更新成功' : '知识创建成功'
      })

      router.push('/knowledge-base')
      router.refresh()
    } catch (error) {
      toast.error('保存失败', {
        description: error instanceof Error ? error.message : '请检查表单并重试'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{knowledge?.id ? '编辑知识' : '新建知识'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入内容"
                        {...field}
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入分类" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="多个标签用逗号分隔" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label="公开可见"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">公开可见</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/knowledge-base')}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
