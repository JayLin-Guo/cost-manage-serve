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
  CreateTaskCategoryDto,
  TaskCategoryPaginationDto,
  UpdateTaskCategoryDto,
} from './dto/task-category.dto';
import { TaskCategoryService } from './task-category.service';

@Controller('task-category')
@ApiTags('task-category')
export class TaskCategoryController {
  private readonly logger = new Logger(TaskCategoryController.name);

  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @ApiOperation({ summary: '创建任务分类', description: '创建新的任务分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ResponseMessage('创建任务分类成功')
  @Post()
  create(@Body() createDto: CreateTaskCategoryDto) {
    return this.taskCategoryService.create(createDto);
  }

  @ApiOperation({
    summary: '获取任务分类列表',
    description: '获取所有任务分类的列表',
  })
  @ApiResponse({ status: 200, description: '成功获取任务分类列表' })
  @ListResponse('获取任务分类列表成功')
  @Get()
  findAll(@Query() query: TaskCategoryPaginationDto) {
    if (query.pageNum) {
      return this.taskCategoryService.findAllByPagination(query);
    } else {
      return this.taskCategoryService.findAll();
    }
  }

  @ApiOperation({
    summary: '获取任务分类下拉列表',
    description: '获取所有任务分类的下拉列表',
  })
  @ApiResponse({ status: 200, description: '成功获取任务分类列表' })
  @ListResponse('获取任务分类下拉列表成功')
  @Get('getRelevanceListByTaskCategory')
  findAllList() {
    return this.taskCategoryService.findListBySelect();
  }

  @ApiOperation({
    summary: '获取任务分类详情',
    description: '根据ID获取任务分类详情',
  })
  @ApiResponse({ status: 200, description: '成功获取任务分类详情' })
  @ResponseMessage('获取任务分类详情成功')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskCategoryService.findOne(id);
  }

  @ApiOperation({
    summary: '更新任务分类',
    description: '根据ID更新任务分类信息',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ResponseMessage('更新任务分类成功')
  @Post('update/:id') // 改为 POST 方式，路径改为 update/:id
  update(@Param('id') id: string, @Body() updateDto: UpdateTaskCategoryDto) {
    return this.taskCategoryService.update(id, updateDto);
  }

  @ApiOperation({ summary: '删除任务分类', description: '根据ID删除任务分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ResponseMessage('删除任务分类成功')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskCategoryService.remove(id);
  }
}
