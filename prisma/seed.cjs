const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 创建初始项目
  await prisma.project.createMany({
    data: [
      {
        name: '海纳嗨数',
        type: 'HINA',
        description: '海纳嗨数测试项目'
      },
      {
        name: '迅信OMS',
        type: 'XUNXIN', 
        description: '迅信OMS测试项目'
      }
    ],
    skipDuplicates: true
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
