import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TitlesService } from './titles.service.js';
import { DiscoverTitlesDto } from './dto/discover-titles.dto.js';
import { SearchTitlesDto } from './dto/search-titles.dto.js';

@ApiTags('Titles & TMDB')
@Controller('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('genres')
  @ApiOperation({ summary: 'Get all movie and TV genres (synced with TMDB)' })
  getGenres() {
    return this.titlesService.getGenres();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies and TV shows from TMDB' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'movie', 'tv'] })
  @ApiQuery({ name: 'window', required: false, enum: ['day', 'week'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  getTrending(
    @Query('type') type: 'all' | 'movie' | 'tv' = 'all',
    @Query('window') window: 'day' | 'week' = 'week',
    @Query('page') page = '1',
  ) {
    return this.titlesService.getTrending(type, window, Number(page) || 1);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover movies or TV shows with genre, year & rating filters' })
  discover(@Query() dto: DiscoverTitlesDto) {
    return this.titlesService.discover(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search movies and TV shows by title' })
  search(@Query() dto: SearchTitlesDto) {
    return this.titlesService.search(dto);
  }

  @Get('cached/:id')
  @ApiOperation({ summary: 'Get a title already cached in Supabase by CineSocial UUID' })
  getCachedById(@Param('id') id: string) {
    return this.titlesService.getCachedTitleById(id);
  }

  @Get(':type/:tmdbId')
  @ApiOperation({
    summary: 'Get full title details, YouTube trailer & cast (and cache in Supabase)',
  })
  @ApiParam({ name: 'type', enum: ['movie', 'tv'] })
  @ApiParam({ name: 'tmdbId', example: 157336, description: 'TMDB numeric ID (e.g., 157336 = Interstellar)' })
  getTitleDetails(
    @Param('type') type: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    if (type !== 'movie' && type !== 'tv') {
      throw new BadRequestException('Type must be either "movie" or "tv"');
    }
    return this.titlesService.getTitleDetailsAndCache(type, tmdbId);
  }
}