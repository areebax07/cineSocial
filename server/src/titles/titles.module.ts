import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service.js';
import { TitlesController } from './titles.controller.js';

@Module({
  controllers: [TitlesController],
  providers: [TitlesService],
  exports: [TitlesService],
})
export class TitlesModule {}