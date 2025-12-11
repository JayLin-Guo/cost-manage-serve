import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ListResponse,
  ResponseMessage,
} from '../../common/decorators/api-response.decorator';
import {
  AssignRoleToStepDto,
  BatchAssignRolesDto,
  CreateReviewStepTemplateDto,
  ReviewStepTemplatePaginationDto,
  UpdateReviewStepTemplateDto,
} from './dto/review-step-template.dto';
import { ReviewStepTemplateService } from './review-step-template.service';

@Controller('review-step-template')
@ApiTags('review-step-template')
export class ReviewStepTemplateController {
  private readonly logger = new Logger(ReviewStepTemplateController.name);

  constructor(
    private readonly reviewStepTemplateService: ReviewStepTemplateService,
  ) {}

  @ApiOperation({
    summary: '创建审核步骤模板',
    description: '创建新的审核步骤模板（步骤池）',
  })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ResponseMessage('创建审核步骤模板成功')
  @Post()
  create(@Body() createDto: CreateReviewStepTemplateDto) {
    return this.reviewStepTemplateService.create(createDto);
  }

  @ApiOperation({
    summary: '获取审核步骤模板列表',
    description: '获取所有审核步骤模板的列表，支持分页和筛选',
  })
  @ApiResponse({ status: 200, description: '成功获取审核步骤模板列表' })
  @ListResponse('获取审核步骤模板列表成功')
  @Get()
  findAll(@Query() query: ReviewStepTemplatePaginationDto) {
    if (query.pageNum) {
      return this.reviewStepTemplateService.findAllByPagination(query);
    } else {
      return this.reviewStepTemplateService.findAll();
    }
  }

  @ApiOperation({
    summary: '根据步骤类型查询',
    description: '根据步骤类型查询审核步骤模板',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ResponseMessage('查询成功')
  @Get('by-type/:stepType')
  findByStepType(@Param('stepType') stepType: string) {
    return this.reviewStepTemplateService.findByStepType(stepType);
  }

  @ApiOperation({
    summary: '获取审核步骤模板详情',
    description: '根据ID获取审核步骤模板详情',
  })
  @ApiResponse({ status: 200, description: '成功获取审核步骤模板详情' })
  @ResponseMessage('获取审核步骤模板详情成功')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewStepTemplateService.findOne(id);
  }

  @ApiOperation({
    summary: '更新审核步骤模板',
    description: '根据ID更新审核步骤模板信息',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ResponseMessage('更新审核步骤模板成功')
  @Post('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewStepTemplateDto,
  ) {
    return this.reviewStepTemplateService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '删除审核步骤模板',
    description: '根据ID删除审核步骤模板',
  })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ResponseMessage('删除审核步骤模板成功')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewStepTemplateService.remove(id);
  }

  // ==================== 角色管理相关接口 ====================

  @ApiOperation({
    summary: '为步骤模板分配角色',
    description: '为指定的审核步骤模板分配一个审核角色',
  })
  @ApiResponse({ status: 201, description: '分配成功' })
  @ResponseMessage('分配角色成功')
  @Post(':id/roles')
  assignRole(@Param('id') id: string, @Body() assignDto: AssignRoleToStepDto) {
    return this.reviewStepTemplateService.assignRole(id, assignDto);
  }

  @ApiOperation({
    summary: '批量分配角色',
    description: '为指定的审核步骤模板批量分配多个审核角色',
  })
  @ApiResponse({ status: 201, description: '批量分配成功' })
  @ResponseMessage('批量分配角色成功')
  @Post(':id/roles/batch')
  batchAssignRoles(
    @Param('id') id: string,
    @Body() batchDto: BatchAssignRolesDto,
  ) {
    return this.reviewStepTemplateService.batchAssignRoles(id, batchDto);
  }

  @ApiOperation({
    summary: '获取步骤模板的所有角色',
    description: '获取指定审核步骤模板关联的所有审核角色',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ResponseMessage('获取步骤角色列表成功')
  @Get(':id/roles')
  getStepRoles(@Param('id') id: string) {
    return this.reviewStepTemplateService.getStepRoles(id);
  }

  @ApiOperation({
    summary: '移除步骤模板的角色',
    description: '移除指定审核步骤模板的某个审核角色',
  })
  @ApiResponse({ status: 200, description: '移除成功' })
  @ResponseMessage('移除角色成功')
  @Delete(':id/roles/:roleCategoryId')
  removeRole(
    @Param('id') id: string,
    @Param('roleCategoryId') roleCategoryId: string,
  ) {
    return this.reviewStepTemplateService.removeRole(id, roleCategoryId);
  }
}
