import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ConfigureReviewStepsDto,
  CreateReviewConfigDto,
  ReviewConfigPaginationDto,
  UpdateReviewConfigDto,
} from './dto/review-config.dto';
import { ReviewConfigService } from './review-config.service';

import {
  ListResponse,
  ResponseMessage,
} from '../../common/decorators/api-response.decorator';

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

  // ==================== 审核步骤管理接口 ====================

  @ApiOperation({
    summary: '配置审核步骤',
    description: '为审核配置设置步骤流程（覆盖模式，传空数组可清空所有步骤）',
  })
  @ApiResponse({ status: 200, description: '配置成功' })
  @ResponseMessage('配置审核步骤成功')
  @Post('configure-steps/:id')
  configureSteps(
    @Param('id') id: string,
    @Body() stepsData: ConfigureReviewStepsDto,
  ) {
    return this.reviewConfigService.setSteps(id, stepsData);
  }

  @ApiOperation({
    summary: '获取审核步骤配置',
    description: '获取指定审核配置的步骤流程',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ResponseMessage('获取审核步骤配置成功')
  @Get('steps/:id')
  getStepsConfig(@Param('id') id: string) {
    return this.reviewConfigService.getSteps(id);
  }
}
