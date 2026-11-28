import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListMessagesDto {
  @ApiPropertyOptional({ default: 30, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;

  @ApiPropertyOptional({
    example: '2026-11-25T10:00:00.000Z',
    description: 'Cursor: only return messages older than this. Use nextCursor from the previous response.',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}