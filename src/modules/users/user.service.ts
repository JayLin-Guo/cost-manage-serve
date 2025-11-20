import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreatedDto, UserPaginationDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
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

  // 增加用户
  async created(createdDto: UserCreatedDto, creatorId?: string) {
    if (createdDto.password !== createdDto.confirmPassword) {
      throw new Error(`两次密码不相符 : ${createdDto.password}`);
    }

    const isUser = await this.Prisma.user.findUnique({
      where: { username: createdDto.username },
    });

    if (isUser) {
      throw new Error(`该用户名已经存在`);
    }
    const data: Omit<UserCreatedDto, 'confirmPassword'> = {
      phone: createdDto.phone?.trim(),
      username: createdDto.username?.trim(),
      password: createdDto.password?.trim(),
      name: createdDto.name?.trim(),
      email: createdDto.email?.trim() || null,
      role: createdDto.role,
    };

    try {
      const result = await this.Prisma.user.create({
        data,
        include: {},
      });
      return result;
    } catch (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }
}
