import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReviewConfigDto,
  ReviewConfigPaginationDto,
  UpdateReviewConfigDto,
} from './dto/review-config.dto';

@Injectable()
export class ReviewConfigService {
  private readonly logger = new Logger(ReviewConfigService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReviewConfigDto) {
    // 检查code是否存在
    const isCodeExist = await this.prisma.reviewConfig.findUnique({
      where: { code: data.code },
    });

    if (isCodeExist) {
      throw new BadRequestException(`审核配置编码 ${data.code} 已存在`);
    }

    const reviewConfig = await this.prisma.reviewConfig.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    if (data.taskCategoryIds && data.taskCategoryIds.length > 0) {
      await this.prisma.taskCategory.updateMany({
        where: { id: { in: data.taskCategoryIds } },
        data: { reviewConfigId: reviewConfig.id },
      });
    }

    return reviewConfig;
  }

  // 分页查找
  async findAllByPagination(query: ReviewConfigPaginationDto) {
    const { pageNum = '1', pageSize = '10', name, code } = query;

    if (!name && !code) {
      return this.prisma.reviewConfig.findMany({
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
      });
    }

    const whereCondition =
      name || code
        ? {
            OR: [{ name: { contains: name } }, { code: { contains: code } }],
          }
        : {};

    const [list, total] = await Promise.all([
      this.prisma.reviewConfig.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          steps: {
            include: {
              reviewStepTemplate: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  stepType: true,
                },
              },
            },
            orderBy: { stepOrder: 'asc' },
          },
          taskCategories: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              steps: true,
              taskCategories: true,
            },
          },
        },
      }),
      this.prisma.reviewConfig.count({
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

  // 查找全部，不带分页结构
  async findAll() {
    return this.prisma.reviewConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          include: {
            reviewStepTemplate: {
              select: {
                id: true,
                name: true,
                code: true,
                stepType: true,
              },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
        taskCategories: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            steps: true,
            taskCategories: true,
          },
        },
      },
    });
  }

  // 查找单个
  async findOne(id: string) {
    const info = await this.prisma.reviewConfig.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            reviewStepTemplate: {
              include: {
                stepRoles: {
                  include: {
                    roleCategory: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
        taskCategories: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
        _count: {
          select: {
            steps: true,
            taskCategories: true,
          },
        },
      },
    });

    if (!info) {
      throw new BadRequestException('审核配置不存在');
    }

    return info;
  }

  //更新
  async update(id: string, data: UpdateReviewConfigDto) {
    const info = await this.findOne(id);

    if (info.isActive === false) {
      throw new BadRequestException('审核配置已禁用，无法更新');
    }
    // 查找编码是否与别的重复
    if (data.code) {
      const isCodeExist = await this.prisma.reviewConfig.findFirst({
        where: { code: data.code, NOT: { id } },
      });
      if (isCodeExist) {
        throw new BadRequestException(`审核配置编码 ${data.code} 已存在`);
      }
    }

    await this.prisma.reviewConfig.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    if (data.taskCategoryIds && data.taskCategoryIds.length > 0) {
      await this.prisma.taskCategory.updateMany({
        where: { reviewConfigId: id },
        data: { reviewConfigId: null },
      });

      await this.prisma.taskCategory.updateMany({
        where: { id: { in: data.taskCategoryIds } },
        data: { reviewConfigId: id },
      });
    }

    return;
  }

  async delete(id: string) {
    // 检查配置是否存在
    await this.findOne(id);

    // 检查是否有任务分类正在使用这个配置
    const taskCategoriesCount = await this.prisma.taskCategory.count({
      where: { reviewConfigId: id },
    });

    if (taskCategoriesCount > 0) {
      throw new BadRequestException(
        `该审核配置正被 ${taskCategoriesCount} 个任务分类使用，无法删除`,
      );
    }

    // 删除审核配置（会级联删除审核步骤）
    return this.prisma.reviewConfig.delete({
      where: { id },
    });
  }
}
