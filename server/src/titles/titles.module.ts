import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service.js';
import { TitlesController } from './titles.controller.js';

@Module({
  providers: [TitlesService],
  controllers: [TitlesController]
})
export class TitlesModule {}
