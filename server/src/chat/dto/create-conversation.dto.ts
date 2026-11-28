import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ example: 'direct', enum: ['direct', 'group'] })
  @IsIn(['direct', 'group'])
  type: 'direct' | 'group';

  @ApiProperty({
    type: [String],
    description: 'Other users (not you). Direct: exactly 1. Group: at least 2.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  participantIds: string[];

  @ApiPropertyOptional({ example: 'Friday Movie Night', description: 'Required for groups' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}