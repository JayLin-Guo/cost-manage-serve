import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPaginationDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private Prisma: PrismaService) {}

  //查找全部
  async findAll() {
    return this.Prisma.user.findMany();
  }

  // 分页查找
  async findAllByPagination(query: UserPaginationDto) {
    const { pageNum, pageSize, keyword } = query;

    const whereCondition = {
      OR: [{ username: { contains: keyword } }],
    };

    const [list, total] = await Promise.all([
      this.Prisma.user.findMany({
        where: whereCondition,
        skip: (Number(pageNum) - 1) * Number(pageSize),
        take: Number(pageSize),
        // include: {},
        orderBy: { createdAt: 'desc' },
      }),
      this.Prisma.user.count({
        where: whereCondition,
      }),
    ]);

    return {
      list,
      total,
    };
  }
  // 查询单个
  async findOne(id: string) {
    return this.Prisma.user.findUnique({ where: { id } });
  }
}
