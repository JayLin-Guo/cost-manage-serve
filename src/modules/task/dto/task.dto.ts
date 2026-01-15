import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// 审核步骤分配DTO
export class ReviewStageAssignmentDto {
  @IsString()
  @ApiProperty({
    description: '步骤模板ID（从ReviewStepTemplate表）',
    example: 'step_template_123456',
  })
  stepConfigId: string;

  @IsString()
  @ApiProperty({ description: '步骤名称', example: '一审' })
  stepName: string;

  @IsString()
  @ApiProperty({
    description: '审核人ID（具体的用户ID）',
    example: 'user_123456',
  })
  reviewerId: string;
}

export class CreateTaskDto {
  @IsString()
  @ApiProperty({ description: '任务名称', example: '某某大厦造价审核' })
  taskName: string;

  @IsString()
  @ApiProperty({ description: '所属项目ID', example: 'proj_123456' })
  projectId: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否需要审核', example: true, default: false })
  isReviewRequired?: boolean;

  @IsString()
  @ApiProperty({ description: '任务分类ID', example: 'cat_123456' })
  taskCategoryId: string;

  @IsString()
  @ApiProperty({ description: '任务负责人ID', example: 'user_123456' })
  taskLeaderId: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '参与人员ID列表',
    example: ['user_123456', 'user_789012'],
    type: [String],
    required: false,
  })
  participantIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReviewStageAssignmentDto)
  @ApiProperty({
    description: '审核步骤分配列表（当isReviewRequired为true时必填）',
    example: [
      {
        stepConfigId: 'step_template_001',
        stepName: '一审',
        reviewerId: 'user_123456',
      },
      {
        stepConfigId: 'step_template_002',
        stepName: '二审',
        reviewerId: 'user_789012',
      },
      {
        stepConfigId: 'step_template_003',
        stepName: '终审',
        reviewerId: 'user_345678',
      },
    ],
    type: [ReviewStageAssignmentDto],
    required: false,
  })
  reviewStageAssignments?: ReviewStageAssignmentDto[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '任务说明',
    example: '本项目需要进行详细的造价审核...',
    required: false,
  })
  description?: string;

  @IsOptional()
  @ApiProperty({
    description: '附件列表',
    example: [{ name: '设计图纸.pdf', url: '/uploads/xxx.pdf' }],
    required: false,
  })
  attachments?: any;
}

export class UpdateTaskDto {
  @IsString()
  @ApiProperty({ description: '任务ID', example: 'task_123456' })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '任务名称',
    example: '某某大厦造价审核',
    required: false,
  })
  taskName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '任务说明',
    example: '本项目需要进行详细的造价审核...',
    required: false,
  })
  description?: string;

  @IsOptional()
  @ApiProperty({
    description: '附件列表',
    example: [{ name: '设计图纸.pdf', url: '/uploads/xxx.pdf' }],
    required: false,
  })
  attachments?: any;
}

export class TaskPaginationDto {
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
  @ApiProperty({ description: '搜索关键词', example: '造价审核' })
  keyword?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '项目ID筛选', example: 'proj_123456' })
  projectId?: string;
}
