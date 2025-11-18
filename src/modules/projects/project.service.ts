import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private Prisma: PrismaService) {}

  // 创建项目
  async create(createProjectDto: CreateProjectDto, creatorId: number) {
    // 处理日期格式转换
    const data = {
      ...createProjectDto,
      creatorId,
      // 如果有日期字段，转换为Date对象
      startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
      endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
    };

    return this.Prisma.project.create({
      data,
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  // 查询所有项目
  async findAll() {
    return this.Prisma.project.findMany({
      include: {
        creator: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 查询单个项目
  async findOne(id: number) {
    return this.Prisma.project.findUnique({ where: { id } });
  }

  // 修改项目
  async update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.Prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  // 删除项目
  async remove(id: number) {
    return this.Prisma.project.delete({ where: { id } });
  }
}
