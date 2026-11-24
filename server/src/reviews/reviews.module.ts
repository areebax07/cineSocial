import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { TitlesModule } from '../titles/titles.module.js';

@Module({
  imports: [TitlesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}