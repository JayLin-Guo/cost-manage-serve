import { Module } from '@nestjs/common';
import { ReviewStepTemplateController } from './review-step-template.controller';
import { ReviewStepTemplateService } from './review-step-template.service';

@Module({
  controllers: [ReviewStepTemplateController],
  providers: [ReviewStepTemplateService],
  exports: [ReviewStepTemplateService],
})
export class ReviewStepTemplateModule {}
