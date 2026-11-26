import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FeedQueryDto {
  @ApiPropertyOptional({ default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: '2026-11-25T10:00:00.000Z',
    description: 'Cursor: only return activity older than this. Use nextCursor from the previous response.',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}