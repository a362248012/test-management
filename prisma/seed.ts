import { PrismaClient } from '@prisma/client'
import { ProjectType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建两个项目
  await prisma.project.createMany({
    data: [
      {
        name: '海纳嗨数',
        type: ProjectType.HINA,
        description: '海纳嗨数测试项目'
      },
      {
        name: '迅信OMS',
        type: ProjectType.XUNXIN,
        description: '迅信OMS测试项目'
      }
    ],
    skipDuplicates: true
  })

  console.log('项目种子数据添加成功')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
