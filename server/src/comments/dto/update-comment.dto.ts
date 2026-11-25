import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Edited: I rewatched it and changed my mind.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}