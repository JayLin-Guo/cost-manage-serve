import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserCreatedDto,
  UserPaginationDto,
  UserUpdateDto,
} from './dto/user.dto';

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
    const userInfo = await this.Prisma.user.findUnique({
      where: { id },
      include: {},
    });
    if (!userInfo) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }

    return userInfo;
  }

  // 查找详情
  async findOnly(id: string) {
    const userDetail = await this.Prisma.user.findUnique({
      where: { id },
    });

    // 分类有值的时候，去查找分类code
    if (userDetail?.roleCategoryId) {
      const categoryDetail = await this.Prisma.roleCategory.findUnique({
        where: { id: userDetail.roleCategoryId },
      });
      return {
        ...userDetail,
        role: categoryDetail?.code,
      };
    }

    return {
      ...userDetail,
      role: '',
    };
  }

  async findUserByRole(roleID: string) {
    return this.Prisma.user.findMany({
      where: { roleCategoryId: roleID },
      select: {
        id: true,
        name: true,
        username: true,
      },
    });
  }

  // 增加用户
  async created(createdDto: UserCreatedDto) {
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
      departmentId: createdDto.departmentId,
      isActive: createdDto.isActive ?? true,
    };

    const result = await this.Prisma.user.create({
      data,
      include: {},
    });
    return result;
  }

  // 修改用户
  async update(id: string, data: UserUpdateDto) {
    // 检查用户是否存在
    await this.findOne(id);

    let roleCategoryId = '';

    // 如果提供了角色code，根据code查找对应的id
    if (data.role) {
      const roleCategory = await this.Prisma.roleCategory.findFirst({
        where: { code: data.role },
      });

      if (!roleCategory) {
        throw new BadRequestException(`角色分类 ${data.role} 不存在`);
      }

      roleCategoryId = roleCategory.id;
    }

    return await this.Prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        name: data.name,
        phone: data.phone,
        roleCategoryId: roleCategoryId || null,
        departmentId: data.department || null,
        email: data.email || '',
        isActive: data.isActive,
      },
    });
  }
}
