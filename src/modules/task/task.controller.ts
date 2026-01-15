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
  CreateTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { TaskService } from './task.service';

@Controller('task')
@ApiTags('task')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: '创建任务', description: '创建新的任务' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ResponseMessage('创建任务成功')
  @Post('createTask')
  create(@Body() createTaskDto: CreateTaskDto) {
    this.logger.log(`创建任务: ${createTaskDto.taskName}`);
    return this.taskService.addTask(createTaskDto);
  }

  @ApiOperation({
    summary: '获取任务列表',
    description: '获取任务列表，支持分页和筛选',
  })
  @ApiResponse({ status: 200, description: '成功获取任务列表' })
  @ListResponse('获取任务列表成功')
  @Get('getTaskList')
  findAll(@Query() query: TaskPaginationDto) {
    if (query.pageNum) {
      return this.taskService.findAllByPagination(query);
    } else {
      return this.taskService.findALL();
    }
  }

  @ApiOperation({
    summary: '获取任务详情',
    description: '根据ID获取任务详情',
  })
  @ApiResponse({ status: 200, description: '成功获取任务详情' })
  @ResponseMessage('获取任务详情成功')
  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.taskService.findTaskDetailById(id);
  }

  @ApiOperation({
    summary: '更新任务',
    description: '根据ID更新任务信息',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ResponseMessage('更新任务成功')
  @Post('updateTask/:id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    this.logger.log(`更新任务: ${id}`);
    return this.taskService.updateTask({ ...updateTaskDto, id });
  }

  @ApiOperation({
    summary: '删除任务',
    description: '根据ID删除任务（软删除）',
  })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ResponseMessage('删除任务成功')
  @Delete('deleteTask/:id')
  remove(@Param('id') id: string) {
    this.logger.log(`删除任务: ${id}`);
    return this.taskService.removeTask(id);
  }

  @ApiOperation({
    summary: '获取项目任务列表',
    description: '获取指定项目下的任务列表',
  })
  @ApiResponse({ status: 200, description: '成功获取项目任务列表' })
  @ListResponse('获取项目任务列表成功')
  @Get('getProjectTaskList/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query() query: Omit<TaskPaginationDto, 'projectId'>,
  ) {
    return this.taskService.findAllByPagination({
      ...query,
      projectId,
    });
  }

  @ApiOperation({
    summary: '获取项目任务简单列表',
    description: '获取项目下的任务简单列表，用于下拉选择',
  })
  @ApiResponse({ status: 200, description: '成功获取项目任务简单列表' })
  @ResponseMessage('获取项目任务简单列表成功')
  @Get('getProjectTaskSimpleList/:projectId')
  findSimpleByProject(@Param('projectId') projectId: string) {
    return this.taskService.findSimpleTasksByProject(projectId);
  }
}
