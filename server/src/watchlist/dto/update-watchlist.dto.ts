import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateWatchlistDto {
  @ApiProperty({
    example: 'seen',
    enum: ['want_to_watch', 'seen'],
  })
  @IsString()
  @IsIn(['want_to_watch', 'seen'])
  status: 'want_to_watch' | 'seen';
}