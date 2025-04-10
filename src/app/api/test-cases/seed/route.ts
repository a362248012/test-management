import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/auth'
import type { Session } from 'next-auth'

const testCaseData = [
  {
    title: '用户登录功能测试',
    description: '验证用户可以使用正确凭据登录',
    steps: '1. 访问登录页面\n2. 输入有效用户名和密码\n3. 点击登录按钮',
    expected: '用户成功登录并跳转到仪表盘',
    status: 'PASSED'
  },
  {
    title: '用户注册表单验证',
    description: '验证注册表单的必填字段验证',
    steps: '1. 访问注册页面\n2. 不填写任何字段\n3. 点击提交按钮',
    expected: '显示所有必填字段的错误提示',
    status: 'PASSED'
  },
  {
    title: '密码重置功能',
    description: '验证密码重置流程',
    steps: '1. 点击忘记密码链接\n2. 输入注册邮箱\n3. 检查收件箱',
    expected: '收到包含重置链接的邮件',
    status: 'FAILED'
  },
  {
    title: '移动端菜单显示',
    description: '验证在小屏幕设备上菜单显示',
    steps: '1. 在移动设备上访问网站\n2. 点击菜单按钮',
    expected: '菜单正确展开并显示所有选项',
    status: 'PENDING'
  },
  {
    title: '购物车商品添加',
    description: '验证商品添加到购物车功能',
    steps: '1. 浏览商品\n2. 点击"添加到购物车"\n3. 查看购物车',
    expected: '商品出现在购物车中',
    status: 'PASSED'
  },
  {
    title: '支付流程测试',
    description: '验证完整的支付流程',
    steps: '1. 添加商品到购物车\n2. 进入结账流程\n3. 完成支付',
    expected: '订单成功创建并显示确认页面',
    status: 'FAILED'
  },
  {
    title: '搜索功能测试',
    description: '验证搜索功能返回相关结果',
    steps: '1. 在搜索框输入关键词\n2. 查看搜索结果',
    expected: '返回与关键词相关的商品',
    status: 'PASSED'
  },
  {
    title: '用户资料更新',
    description: '验证用户能更新个人资料',
    steps: '1. 登录账户\n2. 进入个人资料\n3. 更新信息并保存',
    expected: '资料成功更新并显示新信息',
    status: 'PENDING'
  },
  {
    title: '订单历史记录',
    description: '验证订单历史显示正确',
    steps: '1. 登录账户\n2. 访问订单历史页面',
    expected: '显示用户所有历史订单',
    status: 'PASSED'
  },
  {
    title: '商品筛选功能',
    description: '验证商品筛选器工作正常',
    steps: '1. 访问商品列表\n2. 应用价格筛选\n3. 查看结果',
    expected: '只显示符合筛选条件的商品',
    status: 'FAILED'
  },
  {
    title: '多语言切换',
    description: '验证语言切换功能',
    steps: '1. 点击语言选择器\n2. 选择不同语言',
    expected: '界面文字更新为选定语言',
    status: 'PASSED'
  },
  {
    title: '商品详情页加载',
    description: '验证商品详情页加载速度',
    steps: '1. 点击任意商品\n2. 计时页面加载',
    expected: '页面在2秒内完成加载',
    status: 'PENDING'
  },
  {
    title: '用户注销功能',
    description: '验证用户能安全注销',
    steps: '1. 登录账户\n2. 点击注销按钮',
    expected: '用户会话终止并重定向到登录页',
    status: 'PASSED'
  },
  {
    title: '表单自动填充',
    description: '验证浏览器自动填充功能',
    steps: '1. 开始填写表单\n2. 使用浏览器自动填充',
    expected: '表单字段正确填充',
    status: 'FAILED'
  },
  {
    title: '图片懒加载',
    description: '验证图片懒加载行为',
    steps: '1. 滚动浏览商品列表\n2. 观察图片加载',
    expected: '图片在进入视口时加载',
    status: 'PASSED'
  },
  {
    title: '错误页面处理',
    description: '验证404页面显示',
    steps: '1. 访问不存在的URL',
    expected: '显示自定义404页面',
    status: 'PENDING'
  },
  {
    title: '购物车数量更新',
    description: '验证购物车商品数量修改',
    steps: '1. 在购物车中修改商品数量\n2. 查看总计',
    expected: '总计金额正确更新',
    status: 'PASSED'
  },
  {
    title: '优惠码应用',
    description: '验证优惠码使用流程',
    steps: '1. 在结账页面输入优惠码\n2. 查看价格变化',
    expected: '总价按优惠码规则减少',
    status: 'FAILED'
  },
  {
    title: '移动端手势支持',
    description: '验证滑动操作支持',
    steps: '1. 在移动设备上滑动商品图片',
    expected: '图片正确切换',
    status: 'PASSED'
  },
  {
    title: '性能指标监控',
    description: '验证关键性能指标',
    steps: '1. 使用性能工具测试页面\n2. 记录指标',
    expected: '所有指标在可接受范围内',
    status: 'PENDING'
  }
]

export async function POST() {
  try {
    const session = await getServerSession(authConfig) as Session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 清除现有测试数据
    await prisma.testCase.deleteMany({
      where: {
        createdById: session.user.id
      }
    })

    // 创建新测试数据
    const createdCases = await Promise.all(
      testCaseData.map(data => 
        prisma.testCase.create({
          data: {
            ...data,
            createdById: session.user.id
          }
        })
      )
    )

    return NextResponse.json(createdCases)
  } catch (error) {
    console.error('Error seeding test cases:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
