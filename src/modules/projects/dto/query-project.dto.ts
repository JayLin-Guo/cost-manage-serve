import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryProjectDto {
  @IsString()
  @ApiProperty({ description: '页码', example: '1' })
  pageNum: string;

  @IsString()
  @ApiProperty({ description: '每页大小', example: '10' })
  pageSize: string;

  @IsString()
  @ApiProperty({ description: '搜索关键词', example: '某某大厦造价审核项目' })
  keyword: string;
}
