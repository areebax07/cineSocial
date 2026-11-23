import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddWatchlistDto {
  @ApiPropertyOptional({
    example: 'b3b8c9d0-1234-5678-9abc-def012345678',
    description: 'CineSocial Title UUID (provide either titleId OR tmdbId + type)',
  })
  @IsOptional()
  @IsUUID()
  titleId?: string;

  @ApiPropertyOptional({
    example: 157336,
    description: 'TMDB numeric ID if title is not yet cached in CineSocial',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tmdbId?: number;

  @ApiPropertyOptional({
    example: 'movie',
    enum: ['movie', 'tv'],
    description: 'Required when adding via tmdbId',
  })
  @IsOptional()
  @IsIn(['movie', 'tv'])
  type?: 'movie' | 'tv';

  @ApiPropertyOptional({
    example: 'want_to_watch',
    enum: ['want_to_watch', 'seen'],
    default: 'want_to_watch',
  })
  @IsOptional()
  @IsIn(['want_to_watch', 'seen'])
  status?: 'want_to_watch' | 'seen' = 'want_to_watch';
}