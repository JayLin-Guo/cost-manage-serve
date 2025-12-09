import { Module } from '@nestjs/common';
import { TaskCategoryController } from './task-category.controller';
import { TaskCategoryService } from './task-category.service';

@Module({
  controllers: [TaskCategoryController],
  providers: [TaskCategoryService],
  exports: [TaskCategoryService],
})
export class TaskCategoryModule {}
