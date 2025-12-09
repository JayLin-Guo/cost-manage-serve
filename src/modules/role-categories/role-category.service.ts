import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRoleCategoryDto,
  RoleCategoryPaginationDto,
  UpdateRoleCategoryDto,
} from './dto/role-category.dto';

@Injectable()
export class RoleCategoryService {
  private readonly logger = new Logger(RoleCategoryService.name);

  constructor(private prisma: PrismaService) {}

  // 创建角色分类
  async create(createDto: CreateRoleCategoryDto) {
    // 检查编码是否已存在
    const existingCategory = await this.prisma.roleCategory.findFirst({
      where: { code: createDto.code },
    });

    if (existingCategory) {
      throw new Error(`角色分类编码 ${createDto.code} 已存在`);
    }

    return this.prisma.roleCategory.create({
      data: {
        name: createDto.name,
        code: createDto.code,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  // 查找全部
  async findAll() {
    return this.prisma.roleCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 分页查找
  async findAllByPagination(query: RoleCategoryPaginationDto) {
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
      this.prisma.roleCategory.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.roleCategory.count({
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
    const roleCategory = await this.prisma.roleCategory.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!roleCategory) {
      throw new NotFoundException(`角色分类 ID ${id} 不存在`);
    }

    return roleCategory;
  }

  // 更新
  async update(id: string, updateDto: UpdateRoleCategoryDto) {
    // 检查是否存在
    await this.findOne(id);

    // 如果更新编码，检查是否重复
    if (updateDto.code) {
      const existingCategory = await this.prisma.roleCategory.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new Error(`角色分类编码 ${updateDto.code} 已存在`);
      }
    }

    return this.prisma.roleCategory.update({
      where: { id },
      data: updateDto,
    });
  }

  // 删除
  async remove(id: string) {
    // 检查是否存在
    await this.findOne(id);

    // 检查是否有关联用户
    const usersCount = await this.prisma.user.count({
      where: { roleCategoryId: id },
    });

    if (usersCount > 0) {
      throw new Error(`该角色分类下还有 ${usersCount} 个用户，无法删除`);
    }

    return this.prisma.roleCategory.delete({
      where: { id },
    });
  }
}
