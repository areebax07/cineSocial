import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({ example: 'Fixed typo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body: string;
}