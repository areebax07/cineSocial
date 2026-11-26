import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto.js';

export class SearchUsersDto extends PaginationQueryDto {
  @ApiProperty({ example: 'Areeba', description: 'Matches display name (case-insensitive)' })
  @IsString()
  @IsNotEmpty()
  q: string;
}