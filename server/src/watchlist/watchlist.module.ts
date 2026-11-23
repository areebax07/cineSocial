import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service.js';
import { WatchlistController } from './watchlist.controller.js';
import { TitlesModule } from '../titles/titles.module.js';

@Module({
  imports: [TitlesModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}