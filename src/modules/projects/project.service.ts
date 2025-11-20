import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private Prisma: PrismaService) {}

  // 创建项目
  async create(createProjectDto: CreateProjectDto, creatorId: string) {
    try {
      // 验证创建者是否存在
      const creator = await this.Prisma.user.findUnique({
        where: { id: creatorId },
      });

      if (!creator) {
        this.logger.error(`创建者不存在: ${creatorId}`);
        throw new Error(`创建者不存在: ${creatorId}`);
      }

      // 处理数据格式转换
      const data = {
        ...createProjectDto,
        creatorId,
        // 处理空字符串，转换为null
        projectSource: createProjectDto.projectSource?.trim() || null,
        contractAmount: createProjectDto.contractAmount?.trim() || null,
        description: createProjectDto.description?.trim() || null,
        // 如果有日期字段，转换为Date对象
        startDate: createProjectDto.startDate
          ? new Date(createProjectDto.startDate)
          : undefined,
        endDate: createProjectDto.endDate
          ? new Date(createProjectDto.endDate)
          : undefined,
      };

      const result = await this.Prisma.project.create({
        data,
        include: {
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
      });

      return result;
    } catch (error) {
      // 重新抛出错误，让上层处理
      throw new Error(`创建项目失败: ${error.message}`);
    }
  }

  // 查询所有项目
  async findAll(query: QueryProjectDto) {
    const { pageNum, pageSize, keyword } = query;

    // 构建查询条件
    const whereCondition = {
      OR: [
        { projectName: { contains: keyword } },
        { projectType: { contains: keyword } },
        { clientUnit: { contains: keyword } },
        { projectSource: { contains: keyword } },
        { contractAmount: { contains: keyword } },
        { description: { contains: keyword } },
      ],
    };

    // 同时查询数据和总数
    const [projects, total] = await Promise.all([
      // 查询当前页数据
      this.Prisma.project.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        include: {
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // 查询总条数
      this.Prisma.project.count({
        where: whereCondition,
      }),
    ]);

    return {
      list: projects,
      total,
      // pagination: {
      //   pageNum: Number(pageNum),
      //   pageSize: Number(pageSize),
      //   total: total,
      //   totalPages: Math.ceil(total / Number(pageSize)),
      // },
    };
  }

  // 查询单个项目
  async findOne(id: string) {
    this.logger.log(id, '详情id==》》');
    return this.Prisma.project.findUnique({ where: { id } });
  }

  // 修改项目
  async update(updateProjectDto: UpdateProjectDto) {
    const project = await this.Prisma.project.findUnique({
      where: { id: updateProjectDto.id },
    });
    if (!project) {
      throw new Error('项目不存在');
    }

    return this.Prisma.project.update({
      where: { id: updateProjectDto.id },
      data: updateProjectDto,
    });
  }

  // 删除项目
  async remove(id: string) {
    return this.Prisma.project.delete({ where: { id } });
  }

  // 查找admin用户
  async findAdminUser() {
    const adminUser = await this.Prisma.user.findFirst({
      where: { username: 'admin' },
    });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    return adminUser;
  }
}
