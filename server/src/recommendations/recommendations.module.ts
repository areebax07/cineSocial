import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';
import { RecommendationsController } from './recommendations.controller.js';
import { TitlesModule } from '../titles/titles.module.js';

@Module({
  imports: [TitlesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}