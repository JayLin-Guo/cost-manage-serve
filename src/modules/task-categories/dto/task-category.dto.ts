import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTaskCategoryDto {
  @IsString()
  @ApiProperty({ description: '任务分类名称', example: '工程造价审核' })
  name: string;

  @IsString()
  @ApiProperty({ description: '任务分类编码', example: 'COST_AUDIT' })
  code: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true })
  isActive?: boolean;
}

export class UpdateTaskCategoryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '任务分类名称', example: '工程造价审核' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '任务分类编码', example: 'COST_AUDIT' })
  code?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '是否启用', example: true })
  isActive?: boolean;
}

export class TaskCategoryPaginationDto {
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
  @ApiProperty({ description: '搜索关键词', example: '造价' })
  keyword?: string;
}
