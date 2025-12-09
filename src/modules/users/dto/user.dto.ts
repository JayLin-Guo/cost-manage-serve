import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN', // 系统管理员
  COST_ENGINEER = 'COST_ENGINEER', // 造价工程师
  SUPERVISOR = 'SUPERVISOR', // 项目主管
  STAFF = 'STAFF', // 普通员工
}

export class UserPaginationDto {
  @IsString()
  @ApiProperty({ description: '页码', example: '1' })
  pageNum?: string;

  @IsString()
  @ApiProperty({ description: '每页大小', example: '10' })
  pageSize?: string;

  @IsString()
  @ApiProperty({ description: '搜索关键词', example: '某某大厦造价审核项目' })
  keyword?: string;
}

export class UserCreatedDto {
  @IsString()
  @ApiProperty({ description: '用户名' })
  username: string;

  @IsString()
  @ApiProperty({ description: '用户名称' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '手机号' })
  phone?: string;

  @IsString()
  @ApiProperty({ description: '密码' })
  password: string;

  @IsString()
  @ApiProperty({ description: '二次确认密码' })
  confirmPassword: string;

  @IsString()
  @ApiProperty({ description: '邮箱' })
  email?: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '角色' })
  role: UserRole;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '部门ID' })
  departmentId?: string;

  @IsBoolean()
  @ApiProperty({ description: '是否启用' })
  isActive?: boolean;
}
