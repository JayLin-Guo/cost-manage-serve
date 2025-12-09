import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRoleCategoryDto {
  @IsString()
  @ApiProperty({ description: '角色分类名称', example: '管理层' })
  name: string;

  @IsString()
  @ApiProperty({ description: '角色分类编码', example: 'MANAGEMENT' })
  code: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true })
  isActive?: boolean;
}

export class UpdateRoleCategoryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '角色分类名称', example: '管理层' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '角色分类编码', example: 'MANAGEMENT' })
  code?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true })
  isActive?: boolean;
}

export class RoleCategoryPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '页码', example: '1' })
  pageNum?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '每页大小', example: '10' })
  pageSize?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '搜索关键词', example: '管理' })
  keyword?: string;
}
