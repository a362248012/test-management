'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users', {
        credentials: 'include' // 包含认证cookie
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '获取用户失败')
      }
      const data = await res.json()
      console.log('API返回的用户数据:', data)
      setUsers(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editUser ? 'PUT' : 'POST'
      const url = editUser 
        ? `/api/admin/users` 
        : '/api/admin/users'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUser ? { id: editUser.id, ...formData } : formData)
      })

      if (!res.ok) throw new Error(editUser ? '更新用户失败' : '创建用户失败')

      toast.success(editUser ? '用户更新成功' : '用户创建成功')
      setEditUser(null)
      setFormData({ name: '', email: '', password: '' })
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '未知错误')
    }
  }

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '删除用户失败')
      }

      toast.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '未知错误')
    } finally {
      setDeleteUserId(null)
    }
  }, [])

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex gap-4">
          <Input
            placeholder="搜索用户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>添加用户</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editUser ? '编辑用户' : '添加用户'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                  placeholder="姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="邮箱"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  type="password"
                  placeholder="密码"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editUser}
                />
                <Button type="submit" className="w-full">
                  {editUser ? '更新' : '创建'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>注册时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">加载中...</TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">没有找到用户</TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name ?? '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.emailVerified?.toLocaleString() ?? '-'}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditUser(user)
                      setFormData({
                        name: user.name ?? '',
                        email: user.email,
                        password: ''
                      })
                    }}
                  >
                    编辑
                  </Button>
                  <Dialog open={deleteUserId === user.id} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        删除
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认删除用户</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <p>确定要删除用户 {user.name ?? user.email} 吗？此操作无法撤销。</p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDeleteUserId(null)}>
                            取消
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            确认删除
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
