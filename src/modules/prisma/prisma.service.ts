import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // 模块初始化时连接数据库
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  // 模块销毁时断开数据库连接
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }

  // 可选：添加一些自定义方法
  async cleanDatabase() {
    // 开发环境下清理数据库的方法
    if (process.env.NODE_ENV === 'development') {
      // 按照外键依赖顺序删除
      await this.project.deleteMany();
      await this.reviewerAssignment.deleteMany();
      await this.user.deleteMany();
    }
  }

  // 可选：健康检查方法
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error: error.message };
    }
  }
}