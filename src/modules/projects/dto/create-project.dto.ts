import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', example: '某某大厦造价审核项目' })
  @IsString()
  projectName: string;

  @ApiProperty({ description: '项目类型', example: '造价审核' })
  @IsString()
  projectType: string;

  @ApiProperty({ description: '委托单位', example: '某某建设集团有限公司' })
  @IsString()
  clientUnit: string;

  @ApiProperty({ description: '项目来源', example: '招标', required: false })
  @IsOptional()
  @IsString()
  projectSource?: string;

  @ApiProperty({ description: '合同金额', example: '1000000', required: false })
  @IsOptional()
  @IsString()
  contractAmount?: string;

  @ApiProperty({
    description: '项目描述',
    example: '这是一个重要的造价审核项目',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '附件信息', required: false })
  @IsOptional()
  attachments?: any;

  @ApiProperty({
    description: '开始日期',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '结束日期',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
