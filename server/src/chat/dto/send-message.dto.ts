import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

// Used by the Socket.IO `message:send` event
export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  conversationId: string;

  @ApiPropertyOptional({ example: 'You have to watch this!', description: 'Optional if a title is shared' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;

  @ApiPropertyOptional({ description: 'Share a title already cached in CineSocial' })
  @IsOptional()
  @IsUUID()
  sharedTitleId?: string;

  @ApiPropertyOptional({ example: 157336, description: 'Share a TMDB title (auto-cached); needs type' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tmdbId?: number;

  @ApiPropertyOptional({ example: 'movie', enum: ['movie', 'tv'] })
  @IsOptional()
  @IsIn(['movie', 'tv'])
  type?: 'movie' | 'tv';
}