import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { z } from 'zod'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const imageFile = formData.get('image') as File | null

    let imageUrl = undefined
    if (imageFile) {
      // 这里需要实现文件上传逻辑
      // 实际项目中应该上传到云存储或本地文件系统
      // 这里简化处理，只保存文件名
      imageUrl = `/uploads/${imageFile.name}`
    }

    const user = await register({
      name: name || '',
      email,
      password,
      image: imageUrl
    })

    return NextResponse.json(
      { 
        message: '注册成功', 
        user: { 
          id: user.id, 
          email: user.email 
        } 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
