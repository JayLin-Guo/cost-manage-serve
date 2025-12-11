import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// 审核步骤配置（用于创建时嵌套）
export class ReviewStepConfigDto {
  @IsString()
  @ApiProperty({
    description: '审核步骤模板ID',
    example: 'clxxxxx',
  })
  reviewStepTemplateId: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '步骤顺序',
    example: 1,
  })
  stepOrder: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '是否必须步骤',
    example: true,
    required: false,
  })
  isRequired?: boolean;
}

export class CreateReviewConfigDto {
  @IsString()
  @ApiProperty({ description: '配置名称', example: '标准三级审核流程' })
  name: string;

  @IsString()
  @ApiProperty({ description: '配置编码', example: 'standard_3_level' })
  code: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置描述',
    example: '适用于大型工程造价审核',
    required: false,
  })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true, required: false })
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewStepConfigDto)
  @IsOptional()
  @ApiProperty({
    description: '审核步骤配置列表',
    type: [ReviewStepConfigDto],
    required: false,
    example: [
      {
        reviewStepTemplateId: 'clxxxxx',
        stepOrder: 1,
        isRequired: true,
      },
      {
        reviewStepTemplateId: 'clyyyyy',
        stepOrder: 2,
        isRequired: true,
      },
    ],
  })
  steps?: ReviewStepConfigDto[];

  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    description: '关联的任务分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
    required: false,
  })
  taskCategoryIds?: string[];
}

export class UpdateReviewConfigDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置名称',
    example: '标准三级审核流程',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置编码',
    example: 'standard_3_level',
    required: false,
  })
  code?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置描述',
    example: '适用于大型工程造价审核',
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
    description: '关联的任务分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
    required: false,
  })
  taskCategoryIds?: string[];
}

export class ReviewConfigPaginationDto {
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
  @ApiProperty({
    description: '搜索关键词',
    example: '三级审核',
    required: false,
  })
  keyword?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置名称',
    example: '标准三级审核流程',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '配置编码',
    example: 'standard_3_level',
    required: false,
  })
  code?: string;
}

export class AddReviewStepDto {
  @IsString()
  @ApiProperty({
    description: '审核步骤模板ID',
    example: 'clxxxxx',
  })
  reviewStepTemplateId: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '步骤顺序',
    example: 1,
  })
  stepOrder: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '是否必须步骤',
    example: true,
    required: false,
  })
  isRequired?: boolean;
}

export class BatchAddReviewStepsDto {
  @ApiProperty({
    description: '审核步骤列表',
    type: [AddReviewStepDto],
    example: [
      {
        reviewStepTemplateId: 'clxxxxx',
        stepOrder: 1,
        isRequired: true,
      },
      {
        reviewStepTemplateId: 'clyyyyy',
        stepOrder: 2,
        isRequired: true,
      },
    ],
  })
  steps: AddReviewStepDto[];
}

export class UpdateReviewStepDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({
    description: '步骤顺序',
    example: 1,
    required: false,
  })
  stepOrder?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: '是否必须步骤',
    example: true,
    required: false,
  })
  isRequired?: boolean;
}

// 分配审核配置给任务分类
export class AssignConfigToTaskCategoryDto {
  @IsString()
  @ApiProperty({
    description: '任务分类ID',
    example: 'clxxxxx',
  })
  taskCategoryId: string;
}

// 批量分配审核配置给多个任务分类
export class BatchAssignConfigDto {
  @IsString({ each: true })
  @ApiProperty({
    description: '任务分类ID列表',
    example: ['clxxxxx', 'clyyyyy'],
    type: [String],
  })
  taskCategoryIds: string[];
}
