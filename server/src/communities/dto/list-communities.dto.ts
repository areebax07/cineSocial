import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto.js';

export class ListCommunitiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'sci-fi', description: 'Search by community name' })
  @IsOptional()
  @IsString()
  q?: string;
}