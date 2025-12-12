import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { PrismaModule } from './modules/prisma/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ReviewConfigModule } from './modules/review-config/review-config.module';
import { ReviewStepTemplateModule } from './modules/review-step-template/review-step-template.module';
import { RoleCategoryModule } from './modules/role-categories/role-category.module';
import { TaskCategoryModule } from './modules/task-categories/task-category.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    UserModule,
    RoleCategoryModule,
    TaskCategoryModule,
    ReviewStepTemplateModule,
    ReviewConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
