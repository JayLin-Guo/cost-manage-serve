import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @ApiProperty({ description: '任务名称', example: '某某大厦造价审核' })
  taskName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '所属项目ID',
    example: 'proj_123456',
    required: false,
  })
  projectId?: string;

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
    description: '所属项目ID',
    example: 'proj_123456',
    required: false,
  })
  projectId?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否需要审核', example: true, required: false })
  isReviewRequired?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '任务分类ID',
    example: 'cat_123456',
    required: false,
  })
  taskCategoryId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '任务负责人ID',
    example: 'user_123456',
    required: false,
  })
  taskLeaderId?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: '参与人员ID列表',
    example: ['user_123456', 'user_789012'],
    type: [String],
    required: false,
  })
  participantIds?: string[];

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

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '任务分类ID筛选', example: 'cat_123456' })
  taskCategoryId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '负责人ID筛选', example: 'user_123456' })
  taskLeaderId?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否需要审核筛选', example: true })
  isReviewRequired?: boolean;
}

// 任务响应DTO（用于返回数据）
export class TaskResponseDto {
  @ApiProperty({ description: '任务ID' })
  id: string;

  @ApiProperty({ description: '任务名称' })
  taskName: string;

  @ApiProperty({ description: '所属项目ID', required: false })
  projectId?: string;

  @ApiProperty({ description: '是否需要审核' })
  isReviewRequired: boolean;

  @ApiProperty({ description: '任务分类ID' })
  taskCategoryId: string;

  @ApiProperty({ description: '任务负责人ID' })
  taskLeaderId: string;

  @ApiProperty({ description: '任务说明', required: false })
  description?: string;

  @ApiProperty({ description: '附件列表', required: false })
  attachments?: any;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  // 关联数据
  @ApiProperty({ description: '所属项目信息', required: false })
  project?: any;

  @ApiProperty({ description: '任务分类信息' })
  taskCategory?: any;

  @ApiProperty({ description: '任务负责人信息' })
  taskLeader?: any;

  @ApiProperty({ description: '参与人员列表' })
  participants?: any[];
}
