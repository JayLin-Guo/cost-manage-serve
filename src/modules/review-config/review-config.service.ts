import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../users/user.service';
import {
  ConfigureReviewStepsDto,
  CreateReviewConfigDto,
  ReviewConfigPaginationDto,
  UpdateReviewConfigDto,
} from './dto/review-config.dto';

@Injectable()
export class ReviewConfigService {
  private readonly logger = new Logger(ReviewConfigService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateReviewConfigDto) {
    // 检查code是否存在
    const isCodeExist = await this.prisma.reviewConfig.findUnique({
      where: { code: data.code },
    });

    if (isCodeExist) {
      throw new BadRequestException(`审核配置编码 ${data.code} 已存在`);
    }

    // 如果有任务分类，检查是否存在
    if (data.taskCategoryIds && data.taskCategoryIds.length > 0) {
      const taskCategories = await this.prisma.taskCategory.findMany({
        where: { id: { in: data.taskCategoryIds } },
      });

      if (taskCategories.length !== data.taskCategoryIds.length) {
        throw new BadRequestException('部分任务分类不存在');
      }
    }

    // 第一步：创建 reviewConfig
    const reviewConfig = await this.prisma.reviewConfig.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });

    // 第二步：关联任务分类
    if (data.taskCategoryIds && data.taskCategoryIds.length > 0) {
      await this.prisma.taskCategory.updateMany({
        where: { id: { in: data.taskCategoryIds } },
        data: { reviewConfigId: reviewConfig.id },
      });
    }

    // 返回包含关联数据的完整对象
    return this.prisma.reviewConfig.findUnique({
      where: { id: reviewConfig.id },
      include: {
        taskCategories: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  // 分页查找
  async findAllByPagination(query: ReviewConfigPaginationDto) {
    const { pageNum = '1', pageSize = '10', name, code } = query;

    const whereCondition =
      name || code
        ? {
            OR: [{ name: { contains: name } }, { code: { contains: code } }],
          }
        : {};

    const [dataList, total] = await Promise.all([
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

    // 组合数据，添加关联状态字段
    const list = dataList.map(item => ({
      ...item,
      isRelevance: item._count.taskCategories > 0, // 使用已查询的 _count 数据
    }));

    return {
      list,
      total,
      pageNum: Number(pageNum),
      pageSize: Number(pageSize),
    };
  }

  // 查找全部，不带分页结构
  async findAll() {
    const list = await this.prisma.reviewConfig.findMany({
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

    // 添加关联状态字段
    return list.map(item => ({
      ...item,
      isRelevance: item._count.taskCategories > 0,
    }));
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

    // 如果提供了 taskCategoryIds（包括空数组），重新关联
    if (data.taskCategoryIds !== undefined) {
      // 先清空当前配置关联的所有任务分类
      await this.prisma.taskCategory.updateMany({
        where: { reviewConfigId: id },
        data: { reviewConfigId: null },
      });

      // 如果有新的任务分类ID，建立新的关联
      if (data.taskCategoryIds.length > 0) {
        await this.prisma.taskCategory.updateMany({
          where: { id: { in: data.taskCategoryIds } },
          data: { reviewConfigId: id },
        });
      }
    }

    return;
  }

  // ==================== 审核步骤管理 ====================

  // 设置审核配置的步骤（覆盖所有步骤）
  async setSteps(configId: string, stepsData: ConfigureReviewStepsDto) {
    // 检查审核配置是否存在
    await this.findOne(configId);

    // 如果没有步骤数据，清空所有步骤
    if (!stepsData.steps || stepsData.steps.length === 0) {
      await this.prisma.reviewStep.deleteMany({
        where: { reviewConfigId: configId },
      });
      return [];
    }

    // 检查步骤模板是否存在
    const templateIds = stepsData.steps.map(s => s.reviewStepTemplateId);
    const templates = await this.prisma.reviewStepTemplate.findMany({
      where: { id: { in: templateIds } },
    });

    if (templates.length !== templateIds.length) {
      throw new BadRequestException('部分审核步骤模板不存在');
    }

    // 检查步骤顺序是否重复
    // const orders = stepsData.steps.map(s => s.stepOrder);
    // const uniqueOrders = new Set(orders);
    // if (orders.length !== uniqueOrders.size) {
    //   throw new BadRequestException('步骤顺序不能重复');
    // }

    this.logger.log('configId', configId);
    // 使用事务：先删除旧步骤，再创建新步骤
    return this.prisma.$transaction(async prisma => {
      // 删除当前配置的所有步骤
      await prisma.reviewStep.deleteMany({
        where: { reviewConfigId: configId },
      });

      // 创建新的步骤
      const createdSteps = await Promise.all(
        stepsData.steps.map(step =>
          prisma.reviewStep.create({
            data: {
              reviewConfigId: configId,
              reviewStepTemplateId: step.reviewStepTemplateId,
              stepOrder: step.stepOrder,
              isRequired: step.isRequired ?? true,
            },
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
          }),
        ),
      );

      return createdSteps.sort((a, b) => a.stepOrder - b.stepOrder);
    });
  }

  // 获取审核配置的所有步骤
  async getSteps(configId: string) {
    // 检查审核配置是否存在
    await this.findOne(configId);

    return this.prisma.reviewStep.findMany({
      where: { reviewConfigId: configId },
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
    });
  }

  // 根据任务分类查询审核配置
  async getReviewConfigByTaskCategory(taskCategoryId: string) {
    // 查找到当前的审核配置id

    const taskCategory = await this.prisma.taskCategory.findUnique({
      where: { id: taskCategoryId },
      select: {
        reviewConfigId: true,
      },
    });

    if (!taskCategory) {
      throw new BadRequestException('任务分类不存在');
    }

    const reviewConfig = await this.prisma.reviewStep.findMany({
      where: { reviewConfigId: taskCategory.reviewConfigId as string },
      select: {
        id: true,
        // stepOrder: true,
        // isRequired: true,
        reviewStepTemplateId: true,
        reviewConfigId: true,
        reviewStepTemplate: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
            stepRoles: {
              select: {
                id: true,
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
    });
    this.logger.log('reviewConfig', reviewConfig);
    if (!reviewConfig || reviewConfig.length === 0) {
      return [];
    }

    this.logger.log('reviewConfig', reviewConfig[0].reviewStepTemplate);

    // 过滤出激活的步骤
    const activeSteps = reviewConfig.filter(item => {
      return item.reviewStepTemplate.isActive;
    });

    // 异步获取每个角色对应的用户列表
    const response = await Promise.all(
      activeSteps.map(async item => {
        const roleId = item.reviewStepTemplate.stepRoles[0].roleCategory.id;

        // 根据角色ID查询用户列表
        const reviewPersonnel = await this.userService.findUserByRole(roleId);

        return {
          reviewStepTemplateId: item.reviewStepTemplateId,
          reviewConfigId: item.reviewConfigId,
          reviewStepTemplateName: item.reviewStepTemplate.name,
          reviewStepTemplateCode: item.reviewStepTemplate.code,
          reviewStepTemplateStepId: item.reviewStepTemplate.id,
          roleType: item.reviewStepTemplate.stepRoles[0].roleCategory.code,
          roleId: roleId,
          roleName: item.reviewStepTemplate.stepRoles[0].roleCategory.name,
          reviewPersonnel: reviewPersonnel || [], // 填充用户列表
        };
      }),
    );

    return response;
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
