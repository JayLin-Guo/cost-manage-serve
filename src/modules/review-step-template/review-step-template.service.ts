import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ReviewStepType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignRoleToStepDto,
  BatchAssignRolesDto,
  CreateReviewStepTemplateDto,
  ReviewStepTemplatePaginationDto,
  UpdateReviewStepTemplateDto,
} from './dto/review-step-template.dto';

@Injectable()
export class ReviewStepTemplateService {
  private readonly logger = new Logger(ReviewStepTemplateService.name);

  constructor(private prisma: PrismaService) {}

  // 创建审核步骤模板
  async create(createDto: CreateReviewStepTemplateDto) {
    // 检查编码是否已存在
    const existingTemplate = await this.prisma.reviewStepTemplate.findUnique({
      where: { code: createDto.code },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        `审核步骤模板编码 ${createDto.code} 已存在`,
      );
    }

    // 如果有角色ID，检查角色是否存在
    if (createDto.roleCategoryIds && createDto.roleCategoryIds.length > 0) {
      const roleCategories = await this.prisma.roleCategory.findMany({
        where: { id: { in: createDto.roleCategoryIds } },
      });

      if (roleCategories.length !== createDto.roleCategoryIds.length) {
        throw new BadRequestException('部分角色分类不存在');
      }
    }

    // 创建步骤模板和角色关联
    const template = await this.prisma.reviewStepTemplate.create({
      data: {
        name: createDto.name,
        code: createDto.code,
        stepType: createDto.stepType,
        description: createDto.description,
        isActive: createDto.isActive ?? true,
        // 同时创建角色关联
        stepRoles:
          createDto.roleCategoryIds && createDto.roleCategoryIds.length > 0
            ? {
                create: createDto.roleCategoryIds.map(roleCategoryId => ({
                  roleCategoryId,
                })),
              }
            : undefined,
      },
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
    });

    return template;
  }

  // 查找全部
  async findAll() {
    return this.prisma.reviewStepTemplate.findMany({
      orderBy: { createdAt: 'desc' },
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
        _count: {
          select: {
            reviewSteps: true,
            stepRoles: true,
          },
        },
      },
    });
  }

  // 分页查找
  async findAllByPagination(query: ReviewStepTemplatePaginationDto) {
    const {
      pageNum = '1',
      pageSize = '10',
      keyword,
      stepType,
      isActive,
    } = query;

    // 构建查询条件
    const whereCondition: {
      OR?: Array<{
        name?: { contains: string };
        code?: { contains: string };
        description?: { contains: string };
      }>;
      stepType?: ReviewStepType;
      isActive?: boolean;
    } = {};

    if (keyword) {
      whereCondition.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    if (stepType) {
      whereCondition.stepType = stepType;
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive === 'true';
    }

    const [list, total] = await Promise.all([
      this.prisma.reviewStepTemplate.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
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
          _count: {
            select: {
              reviewSteps: true,
              stepRoles: true,
            },
          },
        },
      }),
      this.prisma.reviewStepTemplate.count({
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
    const template = await this.prisma.reviewStepTemplate.findUnique({
      where: { id },
      include: {
        stepRoles: {
          include: {
            roleCategory: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true,
              },
            },
          },
        },
        reviewSteps: {
          include: {
            reviewConfig: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reviewSteps: true,
            stepRoles: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`审核步骤模板 ID ${id} 不存在`);
    }

    return template;
  }

  // 更新
  async update(id: string, updateDto: UpdateReviewStepTemplateDto) {
    // 检查是否存在
    await this.findOne(id);

    // 如果更新编码，检查是否重复
    if (updateDto.code) {
      const existingTemplate = await this.prisma.reviewStepTemplate.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existingTemplate) {
        throw new BadRequestException(
          `审核步骤模板编码 ${updateDto.code} 已存在`,
        );
      }
    }

    // 如果有角色ID，检查角色是否存在
    if (updateDto.roleCategoryIds && updateDto.roleCategoryIds.length > 0) {
      const roleCategories = await this.prisma.roleCategory.findMany({
        where: { id: { in: updateDto.roleCategoryIds } },
      });

      if (roleCategories.length !== updateDto.roleCategoryIds.length) {
        throw new BadRequestException('部分角色分类不存在');
      }
    }

    // 提取角色ID，其余为模板基础信息
    const { roleCategoryIds, ...templateData } = updateDto;

    // 使用事务更新
    return this.prisma.$transaction(async prisma => {
      // 如果提供了角色ID列表，先删除旧的关联，再创建新的
      if (roleCategoryIds !== undefined) {
        // 删除旧的角色关联
        await prisma.reviewStepRole.deleteMany({
          where: { reviewStepTemplateId: id },
        });

        // 如果有新的角色ID，创建新的关联
        if (roleCategoryIds.length > 0) {
          await prisma.reviewStepRole.createMany({
            data: roleCategoryIds.map(roleCategoryId => ({
              reviewStepTemplateId: id,
              roleCategoryId,
            })),
          });
        }
      }

      // 更新模板基础信息
      return prisma.reviewStepTemplate.update({
        where: { id },
        data: templateData,
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
          _count: {
            select: {
              reviewSteps: true,
              stepRoles: true,
            },
          },
        },
      });
    });
  }

  // 删除
  async remove(id: string) {
    // 检查是否存在
    await this.findOne(id);

    // 检查是否有关联的审核步骤实例
    const stepsCount = await this.prisma.reviewStep.count({
      where: { reviewStepTemplateId: id },
    });

    if (stepsCount > 0) {
      throw new BadRequestException(
        `该审核步骤模板已被 ${stepsCount} 个审核配置使用，无法删除`,
      );
    }

    // 先删除关联的角色（会自动级联删除）
    return this.prisma.reviewStepTemplate.delete({
      where: { id },
    });
  }

  // 为步骤模板分配角色
  async assignRole(stepTemplateId: string, assignDto: AssignRoleToStepDto) {
    // 检查步骤模板是否存在
    await this.findOne(stepTemplateId);

    // 检查角色分类是否存在
    const roleCategory = await this.prisma.roleCategory.findUnique({
      where: { id: assignDto.roleCategoryId },
    });

    if (!roleCategory) {
      throw new NotFoundException(
        `角色分类 ID ${assignDto.roleCategoryId} 不存在`,
      );
    }

    // 检查是否已经分配
    const existing = await this.prisma.reviewStepRole.findUnique({
      where: {
        reviewStepTemplateId_roleCategoryId: {
          reviewStepTemplateId: stepTemplateId,
          roleCategoryId: assignDto.roleCategoryId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('该角色已经分配给此步骤模板');
    }

    return this.prisma.reviewStepRole.create({
      data: {
        reviewStepTemplateId: stepTemplateId,
        roleCategoryId: assignDto.roleCategoryId,
      },
      include: {
        roleCategory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  // 批量分配角色
  async batchAssignRoles(
    stepTemplateId: string,
    batchDto: BatchAssignRolesDto,
  ) {
    // 检查步骤模板是否存在
    await this.findOne(stepTemplateId);

    // 检查所有角色分类是否存在
    const roleCategories = await this.prisma.roleCategory.findMany({
      where: { id: { in: batchDto.roleCategoryIds } },
    });

    if (roleCategories.length !== batchDto.roleCategoryIds.length) {
      throw new BadRequestException('部分角色分类不存在');
    }

    // 获取已存在的关联
    const existingRoles = await this.prisma.reviewStepRole.findMany({
      where: {
        reviewStepTemplateId: stepTemplateId,
        roleCategoryId: { in: batchDto.roleCategoryIds },
      },
    });

    const existingRoleIds = existingRoles.map(r => r.roleCategoryId);
    const newRoleIds = batchDto.roleCategoryIds.filter(
      id => !existingRoleIds.includes(id),
    );

    if (newRoleIds.length === 0) {
      throw new BadRequestException('所有角色都已分配');
    }

    // 批量创建
    const created = await this.prisma.reviewStepRole.createMany({
      data: newRoleIds.map(roleCategoryId => ({
        reviewStepTemplateId: stepTemplateId,
        roleCategoryId,
      })),
    });

    return {
      created: created.count,
      skipped: existingRoleIds.length,
      message: `成功分配 ${created.count} 个角色，跳过 ${existingRoleIds.length} 个已存在的角色`,
    };
  }

  // 移除步骤模板的角色
  async removeRole(stepTemplateId: string, roleCategoryId: string) {
    // 检查关联是否存在
    const roleAssignment = await this.prisma.reviewStepRole.findUnique({
      where: {
        reviewStepTemplateId_roleCategoryId: {
          reviewStepTemplateId: stepTemplateId,
          roleCategoryId,
        },
      },
    });

    if (!roleAssignment) {
      throw new NotFoundException('该角色未分配给此步骤模板');
    }

    await this.prisma.reviewStepRole.delete({
      where: { id: roleAssignment.id },
    });

    return { message: '角色移除成功' };
  }

  // 获取步骤模板的所有角色
  async getStepRoles(stepTemplateId: string) {
    await this.findOne(stepTemplateId);

    return this.prisma.reviewStepRole.findMany({
      where: { reviewStepTemplateId: stepTemplateId },
      include: {
        roleCategory: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 根据步骤类型查询
  async findByStepType(stepType: string) {
    return this.prisma.reviewStepTemplate.findMany({
      where: {
        stepType: stepType as ReviewStepType,
        isActive: true,
      },
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
      orderBy: { createdAt: 'desc' },
    });
  }
}
