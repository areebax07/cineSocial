import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePrivacyDto {
  @ApiPropertyOptional({
    example: 'public',
    enum: ['public', 'friends', 'private'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'friends', 'private'])
  profileVisibility?: string;

  @ApiPropertyOptional({
    example: 'everyone',
    enum: ['everyone', 'following', 'nobody'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['everyone', 'following', 'nobody'])
  whoCanCall?: string;
}