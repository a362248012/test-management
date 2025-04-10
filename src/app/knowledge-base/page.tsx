import KnowledgeBaseList from './components/KnowledgeBaseList'
import { Suspense } from 'react'
import Loading from '@/components/ui/loading'

export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">知识库</h1>
      <Suspense fallback={<Loading />}>
        <KnowledgeBaseList />
      </Suspense>
    </div>
  )
}
