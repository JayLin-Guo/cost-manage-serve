import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
} from './dto/task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger();
  constructor(private readonly Prisma: PrismaService) {}

  async addTask(createdData: CreateTaskDto) {
    this.logger.log(createdData, '创建任务');

    const { participantIds, reviewStageAssignments, ...restData } = createdData;

    return await this.Prisma.$transaction(async tx => {
      // 1. 创建任务基本信息 - 明确指定每个字段
      const task = await tx.task.create({
        data: {
          taskName: restData.taskName,
          projectId: restData.projectId,
          taskCategoryId: restData.taskCategoryId,
          taskLeaderId: restData.taskLeaderId,
          isReviewRequired: restData.isReviewRequired || false,
          description: restData.description,
          attachments: restData.attachments,
        },
      });

      // 2. 处理参与人员（如果有）
      if (participantIds && participantIds.length > 0) {
        await tx.taskParticipant.createMany({
          data: participantIds.map(userId => ({
            taskId: task.id,
            userId,
          })),
        });
      }

      // 3. 处理审核流程（如果需要审核且有审核步骤分配）
      if (
        restData.isReviewRequired &&
        reviewStageAssignments &&
        reviewStageAssignments.length > 0
      ) {
        // 3.1 根据任务分类获取或创建审核配置
        let reviewConfigId: string;

        // 先尝试找到任务分类关联的审核配置
        const taskCategory = await tx.taskCategory.findUnique({
          where: { id: restData.taskCategoryId },
          include: { reviewConfig: true },
        });

        if (taskCategory?.reviewConfig) {
          reviewConfigId = taskCategory.reviewConfig.id;
        } else {
          // 创建一个临时的审核配置
          const tempConfig = await tx.reviewConfig.create({
            data: {
              name: `临时审核配置-${task.id}`,
              code: `temp_config_${Date.now()}`,
              description: '系统自动创建的临时审核配置',
            },
          });
          reviewConfigId = tempConfig.id;
        }

        // 3.2 创建任务审核配置
        const taskReviewConfig = await tx.taskReviewConfig.create({
          data: {
            taskId: task.id,
            reviewConfigId: reviewConfigId,
            status: 'PENDING',
            currentStepOrder: 1,
          },
        });

        // 3.3 创建审核步骤实例
        await tx.taskReviewStage.createMany({
          data: reviewStageAssignments.map((assignment, index) => ({
            taskReviewConfigId: taskReviewConfig.id,
            stepConfigId: assignment.stepConfigId,
            stepOrder: index + 1, // 数组索引转换为步骤顺序
            stepName: assignment.stepName,
            reviewerId: assignment.reviewerId,
            status: 'PENDING',
          })),
        });
      }

      // 4. 返回完整的任务信息
      return await tx.task.findUnique({
        where: { id: task.id },
        include: {
          taskCategory: true,
          taskLeader: true,
          project: true,
          participants: {
            include: {
              user: true,
            },
          },
          reviewConfig: {
            include: {
              reviewStages: {
                include: {
                  reviewer: true,
                  stepConfig: true,
                },
                orderBy: { stepOrder: 'asc' },
              },
            },
          },
        },
      });
    });
  }

  async updateTask(params: UpdateTaskDto) {
    const { id, ...updateData } = params;

    this.logger.log(`更新任务: ${id}`, updateData);

    return await this.Prisma.task.update({
      where: {
        id,
        isDeleted: false,
      },
      data: updateData,
      include: {
        taskCategory: true,
        taskLeader: true,
        project: true,
      },
    });
  }

  async findALL() {
    return await this.Prisma.task.findMany({
      where: { isDeleted: false }, // 只查询未删除的记录
    });
  }

  async findAllByPagination(params: TaskPaginationDto) {
    const { pageNum = '1', pageSize = '10', keyword, projectId } = params;

    const where = {
      isDeleted: false, // 只查询未删除的记录
      ...(projectId && { projectId }), // 按项目筛选
      ...(keyword && {
        OR: [{ taskName: { contains: keyword } }],
      }),
    };

    const [list, total] = await Promise.all([
      await this.Prisma.task.findMany({
        where: where,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: {
          taskCategory: true,
          taskLeader: true,
          project: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
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

  // 查询已删除的任务（回收站功能）
  async findDeletedTasks(params: TaskPaginationDto) {
    const { pageNum = '1', pageSize = '10', keyword } = params;

    const where = {
      isDeleted: true, // 只查询已删除的记录
      ...(keyword && {
        OR: [{ taskName: { contains: keyword } }],
      }),
    };

    const [list, total] = await Promise.all([
      await this.Prisma.task.findMany({
        where: where,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { deletedAt: 'desc' },
        include: {
          taskCategory: true,
          taskLeader: true,
          project: true,
        },
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
  async findTaskDetailById(taskId: string) {
    return await this.Prisma.task.findUnique({
      where: {
        id: taskId,
        isDeleted: false,
      },
      include: {
        taskCategory: true,
        taskLeader: true,
        project: true,
        participants: {
          include: {
            user: true,
          },
        },
        reviewConfig: {
          include: {
            reviewStages: {
              include: {
                reviewer: true,
                stepConfig: true,
              },
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  // 获取项目下的简单任务列表（用于下拉选择）
  async findSimpleTasksByProject(projectId: string) {
    return await this.Prisma.task.findMany({
      where: {
        projectId,
        isDeleted: false,
      },
      select: {
        id: true,
        taskName: true,
        isReviewRequired: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 软删除任务
  async removeTask(taskId: string, deletedBy?: string) {
    // 软删除：只更新状态，不真正删除数据
    return await this.Prisma.$transaction(async tx => {
      // 1. 软删除任务
      const deletedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy,
        },
      });

      // 2. 软删除相关的审核配置
      const taskReviewConfig = await tx.taskReviewConfig.findUnique({
        where: { taskId },
        include: { reviewStages: true },
      });

      if (taskReviewConfig) {
        // 软删除审核配置
        await tx.taskReviewConfig.update({
          where: { id: taskReviewConfig.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });

        // 软删除所有审核步骤
        await tx.taskReviewStage.updateMany({
          where: { taskReviewConfigId: taskReviewConfig.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });
      }

      return deletedTask;
    });
  }

  // 恢复已删除的任务
  async restoreTask(taskId: string) {
    return await this.Prisma.$transaction(async tx => {
      // 1. 恢复任务
      const restoredTask = await tx.task.update({
        where: { id: taskId },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      });

      // 2. 恢复相关的审核配置
      const taskReviewConfig = await tx.taskReviewConfig.findUnique({
        where: { taskId },
      });

      if (taskReviewConfig) {
        // 恢复审核配置
        await tx.taskReviewConfig.update({
          where: { id: taskReviewConfig.id },
          data: {
            isDeleted: false,
            deletedAt: null,
          },
        });

        // 恢复所有审核步骤
        await tx.taskReviewStage.updateMany({
          where: { taskReviewConfigId: taskReviewConfig.id },
          data: {
            isDeleted: false,
            deletedAt: null,
          },
        });
      }

      return restoredTask;
    });
  }

  // 物理删除任务（谨慎使用）
  async permanentDeleteTask(taskId: string) {
    // 物理删除：真正从数据库中删除
    // 由于设置了 onDelete: Cascade，会自动删除相关数据
    return await this.Prisma.task.delete({
      where: { id: taskId },
    });
  }
}
