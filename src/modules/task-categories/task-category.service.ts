import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskCategoryDto,
  TaskCategoryPaginationDto,
  UpdateTaskCategoryDto,
} from './dto/task-category.dto';

@Injectable()
export class TaskCategoryService {
  private readonly logger = new Logger(TaskCategoryService.name);

  constructor(private prisma: PrismaService) {}

  // 创建任务分类
  async create(createDto: CreateTaskCategoryDto) {
    // 检查编码是否已存在
    const existingCategory = await this.prisma.taskCategory.findFirst({
      where: { code: createDto.code },
    });

    if (existingCategory) {
      throw new Error(`任务分类编码 ${createDto.code} 已存在`);
    }

    return this.prisma.taskCategory.create({
      data: {
        name: createDto.name,
        code: createDto.code,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  // 查找全部
  async findAll() {
    return this.prisma.taskCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
            stageTemplates: true,
          },
        },
      },
    });
  }

  // 获取任务分类下拉列表
  async findListBySelect() {
    const list = await this.prisma.taskCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        reviewConfigId: true, // 添加这个字段
      },
    });

    return list.map(item => {
      return {
        ...item,
        isRelevance: !!item.reviewConfigId, // 是否已关联审核配置
      };
    });
  }

  // 分页查找
  async findAllByPagination(query: TaskCategoryPaginationDto) {
    const { pageNum = '1', pageSize = '10', keyword } = query;

    const whereCondition = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      this.prisma.taskCategory.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              tasks: true,
              stageTemplates: true,
            },
          },
        },
      }),
      this.prisma.taskCategory.count({
        where: whereCondition,
      }),
    ]);

    return {
      list,
      total,
      pageNum: Number(pageNum),
      pageSize: Number(pageSize),
    };
  }

  // 查询单个
  async findOne(id: string) {
    const taskCategory = await this.prisma.taskCategory.findUnique({
      where: { id },
      include: {
        tasks: {
          select: {
            id: true,
            taskName: true,
            createdAt: true,
          },
          take: 10, // 只显示最近10个任务
          orderBy: { createdAt: 'desc' },
        },
        stageTemplates: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            tasks: true,
            stageTemplates: true,
          },
        },
      },
    });

    if (!taskCategory) {
      throw new NotFoundException(`任务分类 ID ${id} 不存在`);
    }

    return taskCategory;
  }

  // 更新
  async update(id: string, updateDto: UpdateTaskCategoryDto) {
    // 检查是否存在
    await this.findOne(id);

    // 如果更新编码，检查是否重复
    if (updateDto.code) {
      const existingCategory = await this.prisma.taskCategory.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new Error(`任务分类编码 ${updateDto.code} 已存在`);
      }
    }

    return this.prisma.taskCategory.update({
      where: { id },
      data: updateDto,
    });
  }

  // 删除
  async remove(id: string) {
    // 检查是否存在
    await this.findOne(id);

    // 检查是否有关联任务
    const tasksCount = await this.prisma.task.count({
      where: { taskCategoryId: id },
    });

    if (tasksCount > 0) {
      throw new Error(`该任务分类下还有 ${tasksCount} 个任务，无法删除`);
    }

    // 先删除关联的步骤模板
    await this.prisma.taskCategoryStageTemplate.deleteMany({
      where: { taskCategoryId: id },
    });

    return this.prisma.taskCategory.delete({
      where: { id },
    });
  }
}
