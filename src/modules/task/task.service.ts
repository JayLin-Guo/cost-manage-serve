import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
} from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly Prisma: PrismaService) {}

  async addTask(query: CreateTaskDto) {}

  async updateTask(params: UpdateTaskDto) {}

  async findALL() {
    return await this.Prisma.task.findMany();
  }

  async findAllByPagination(params: TaskPaginationDto) {
    const { pageNum = '1', pageSize = '10', keyword } = params;

    const where = keyword
      ? {
          OR: [{ taskName: keyword }],
        }
      : {};

    const [list, total] = await Promise.all([
      await this.Prisma.task.findMany({
        where: where,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
      }),

      await this.Prisma.task.count({
        where,
      }),
    ]);

    return {
      list,
      total,
    };
  }

  //查找全部
  async findAll() {
    return this.Prisma.user.findMany();
  }

  // 获取详情
  async findTaskDetailById(taskId: string) {}
}
