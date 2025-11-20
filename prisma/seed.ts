import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 先删除所有项目记录（因为有外键约束）
  await prisma.project.deleteMany({});
  
  // 再删除现有的admin用户（如果存在）
  await prisma.user.deleteMany({
    where: { username: 'admin' }
  });

  // 创建新的测试用户 - 让Prisma自动生成cuid
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  });

  // 创建测试项目
  await prisma.project.createMany({
    data: [
      {
        projectName: '测试项目-001',
        projectType: 'decoration',
        clientUnit: '北京市建筑公司',
        projectSource: '招标',
        contractAmount: '1000000',
        description: '这是一个测试项目',
        creatorId: user.id,
      },
      {
        projectName: '测试项目-002',
        projectType: 'audit',
        clientUnit: '上海建设集团',
        contractAmount: '2000000',
        creatorId: user.id,
      },
    ],
  });

  console.log('✅ 测试数据创建成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
