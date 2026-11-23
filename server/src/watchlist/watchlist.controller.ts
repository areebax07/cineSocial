import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { WatchlistService } from './watchlist.service.js';
import { AddWatchlistDto } from './dto/add-watchlist.dto.js';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto.js';

@ApiTags('Watchlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a movie/TV show to watchlist (by titleId or tmdbId + type)',
  })
  addToWatchlist(@Req() req: any, @Body() dto: AddWatchlistDto) {
    return this.watchlistService.addToWatchlist(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user watchlist and counts' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['want_to_watch', 'seen'],
  })
  getMyWatchlist(
    @Req() req: any,
    @Query('status') status?: 'want_to_watch' | 'seen',
  ) {
    if (status && status !== 'want_to_watch' && status !== 'seen') {
      throw new BadRequestException(
        'Status must be either "want_to_watch" or "seen"',
      );
    }
    return this.watchlistService.getMyWatchlist(req.user.id, status);
  }

  @Get('check/:titleId')
  @ApiOperation({ summary: 'Check if a specific title is in current user watchlist' })
  checkTitleStatus(@Req() req: any, @Param('titleId') titleId: string) {
    return this.watchlistService.checkTitleStatus(req.user.id, titleId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'View another user watchlist (respects privacy)' })
  getUserWatchlist(@Param('userId') userId: string, @Req() req: any) {
    return this.watchlistService.getUserWatchlist(userId, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Toggle watchlist status between want_to_watch and seen' })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateWatchlistDto,
  ) {
    return this.watchlistService.updateStatus(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an entry from watchlist' })
  removeFromWatchlist(@Req() req: any, @Param('id') id: string) {
    return this.watchlistService.removeFromWatchlist(req.user.id, id);
  }
}