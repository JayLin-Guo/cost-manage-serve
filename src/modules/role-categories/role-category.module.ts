import { Module } from '@nestjs/common';
import { RoleCategoryController } from './role-category.controller';
import { RoleCategoryService } from './role-category.service';

@Module({
  controllers: [RoleCategoryController],
  providers: [RoleCategoryService],
  exports: [RoleCategoryService],
})
export class RoleCategoryModule {}
