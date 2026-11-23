import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class DiscoverTitlesDto {
  @ApiPropertyOptional({ enum: ['movie', 'tv'], default: 'movie' })
  @IsOptional()
  @IsIn(['movie', 'tv'])
  type?: 'movie' | 'tv' = 'movie';

  @ApiPropertyOptional({ example: '28', description: 'TMDB Genre ID (e.g., 28 for Action, 878 for Sci-Fi)' })
  @IsOptional()
  @IsString()
  genreId?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Release or first-air year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 7.5, description: 'Minimum TMDB rating (0 to 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  minRating?: number;

  @ApiPropertyOptional({
    example: 'popularity.desc',
    enum: ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'popularity.desc';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}