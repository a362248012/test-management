import { NextResponse } from 'next/server'
import { z } from 'zod'
import { register } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const user = await register({
      name: validatedData.name || '',
      email: validatedData.email,
      password: validatedData.password
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '输入数据不合法', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    )
  }
}
