import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty({ example: 'Nolan Fans' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'Everything Christopher Nolan.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}