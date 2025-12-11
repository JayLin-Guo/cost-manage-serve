import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateReviewConfigDto,
  ReviewConfigPaginationDto,
  UpdateReviewConfigDto,
} from './dto/review-config.dto';
import { ReviewConfigService } from './review-config.service';

import { ListResponse } from '../../common/decorators/api-response.decorator';

@Controller('review-config')
@ApiTags('review-config')
export class ReviewConfigController {
  private readonly logger = new Logger(ReviewConfigController.name);

  constructor(private readonly reviewConfigService: ReviewConfigService) {}

  @Post('create')
  createReviewConfig(@Body() createDto: CreateReviewConfigDto) {
    return this.reviewConfigService.create(createDto);
  }

  @Get('list')
  @ApiResponse({ status: 200, description: '成功获取审核步骤模板列表' })
  @ListResponse('获取审核步骤模板列表成功')
  findAllByPagination(@Query() query: ReviewConfigPaginationDto) {
    if (query.pageNum) {
      return this.reviewConfigService.findAllByPagination(query);
    } else {
      return this.reviewConfigService.findAll();
    }
  }

  @Get('detail/:id')
  detailReviewConfig(@Param('id') id: string) {
    return this.reviewConfigService.findOne(id);
  }

  @Post('update/:id')
  updateReviewConfig(
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewConfigDto,
  ) {
    return this.reviewConfigService.update(id, updateDto);
  }
}
