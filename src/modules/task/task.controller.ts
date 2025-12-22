import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
} from './dto/task.dto';
import { TaskService } from './task.service';

@Controller('Task')
@ApiTags('Task')
export class TaskyController {
  private readonly logger = new Logger();
  constructor(private TaskService: TaskService) {}

  @Post('addTask')
  create(@Body() createdTaskData: CreateTaskDto) {
    return this.TaskService.addTask(createdTaskData);
  }

  @Post('updateTask')
  update(@Body() updateTaskData: UpdateTaskDto) {
    return this.TaskService.updateTask(updateTaskData);
  }

  @Get('getTaskList')
  findAllList(@Param() TaskPaginationParam: TaskPaginationDto) {
    return this.TaskService.findAllByPagination(TaskPaginationParam);
  }

  @Get('getTaskSelectList')
  findAll() {
    return this.TaskService.findALL();
  }

  @Get('getTaskDetail')
  findDetail(@Param() taskId: string) {
    return this.TaskService.findTaskDetailById(taskId);
  }
}
