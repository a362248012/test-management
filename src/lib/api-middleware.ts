import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth';
import type { Session } from 'next-auth';

export type ApiHandler = (
  request: Request, 
  context?: any, 
  session?: Session
) => Promise<NextResponse>;

/**
 * API中间件：统一处理认证和错误
 */
export function withErrorHandler(handler: ApiHandler) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`API错误: ${request.url}`, error);
      
      // 尝试解析请求体用于调试
      let requestBody = 'Unable to parse request body';
      try {
        const clonedRequest = request.clone();
        requestBody = await clonedRequest.text();
      } catch {}
      
      return NextResponse.json(
        { 
          error: '服务器内部错误',
          details: error instanceof Error ? error.message : String(error),
          requestPath: request.url,
          requestBody: process.env.NODE_ENV === 'development' ? requestBody : undefined
        },
        { status: 500 }
      );
    }
  };
}

/**
 * API中间件：认证检查 + 错误处理
 */
export function withAuth(handler: ApiHandler) {
  return withErrorHandler(async (request: Request, context?: any) => {
    const session = await getServerSession(authConfig) as Session;
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    return handler(request, context, session);
  });
}

/**
 * API中间件：管理员认证 + 错误处理
 */
export function withAdminAuth(handler: ApiHandler) {
  return withErrorHandler(async (request: Request, context?: any) => {
    const session = await getServerSession(authConfig) as Session;
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 这里应该检查用户是否为管理员
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }
    
    return handler(request, context, session);
  });
}
