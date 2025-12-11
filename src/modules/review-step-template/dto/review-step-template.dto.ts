import { ApiProperty } from '@nestjs/swagger';
import { ReviewStepType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReviewStepTemplateDto {
  @IsString()
  @ApiProperty({ description: '步骤名称', example: '初审' })
  name: string;

  @IsString()
  @ApiProperty({ description: '步骤编码', example: 'initial_review' })
  code: string;

  @IsEnum(ReviewStepType)
  @ApiProperty({
    description: '步骤类型',
    enum: ReviewStepType,
    example: 'INITIAL_REVIEW',
  })
  stepType: ReviewStepType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '步骤描述',
    example: '第一级审核',
    required: false,
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true, required: false })
  isActive?: boolean;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    description: '绑定的角色分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
    required: false,
  })
  roleCategoryIds?: string[];
}

export class UpdateReviewStepTemplateDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '步骤名称', example: '初审', required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '步骤编码',
    example: 'initial_review',
    required: false,
  })
  code?: string;

  @IsEnum(ReviewStepType)
  @IsOptional()
  @ApiProperty({
    description: '步骤类型',
    enum: ReviewStepType,
    example: 'INITIAL_REVIEW',
    required: false,
  })
  stepType?: ReviewStepType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '步骤描述',
    example: '第一级审核',
    required: false,
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true, required: false })
  isActive?: boolean;

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    description: '绑定的角色分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
    required: false,
  })
  roleCategoryIds?: string[];
}

export class ReviewStepTemplatePaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '页码', example: '1', required: false })
  pageNum?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '每页大小', example: '10', required: false })
  pageSize?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '搜索关键词', example: '初审', required: false })
  keyword?: string;

  @IsEnum(ReviewStepType)
  @IsOptional()
  @ApiProperty({
    description: '步骤类型筛选',
    enum: ReviewStepType,
    required: false,
  })
  stepType?: ReviewStepType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '是否启用筛选',
    example: 'true',
    required: false,
  })
  isActive?: string;
}

export class AssignRoleToStepDto {
  @IsString()
  @ApiProperty({ description: '角色分类ID', example: 'clxxxxx' })
  roleCategoryId: string;
}

export class BatchAssignRolesDto {
  @IsString({ each: true })
  @ApiProperty({
    description: '角色分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
  })
  roleCategoryIds: string[];
}
