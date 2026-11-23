import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchTitlesDto {
  @ApiProperty({ example: 'Interstellar', description: 'Movie or TV show search query' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ enum: ['all', 'movie', 'tv'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'movie', 'tv'])
  type?: 'all' | 'movie' | 'tv' = 'all';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}