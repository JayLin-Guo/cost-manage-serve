import { Module } from '@nestjs/common';
import { TaskyController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  controllers: [TaskyController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
