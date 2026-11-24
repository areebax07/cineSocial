import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiPropertyOptional({
    example: 'b3b8c9d0-1234-5678-9abc-def012345678',
    description: 'CineSocial Title UUID (provide either titleId OR tmdbId + type)',
  })
  @IsOptional()
  @IsUUID()
  titleId?: string;

  @ApiPropertyOptional({
    example: 157336,
    description: 'TMDB numeric ID if the title is not yet cached',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tmdbId?: number;

  @ApiPropertyOptional({ example: 'movie', enum: ['movie', 'tv'] })
  @IsOptional()
  @IsIn(['movie', 'tv'])
  type?: 'movie' | 'tv';

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Mind-blowing visuals and a gut-punch ending.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}