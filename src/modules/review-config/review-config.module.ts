import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../users/user.module';
import { ReviewConfigController } from './review-config.controller';
import { ReviewConfigService } from './review-config.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ReviewConfigController],
  providers: [ReviewConfigService],
  exports: [ReviewConfigService],
})
export class ReviewConfigModule {}
