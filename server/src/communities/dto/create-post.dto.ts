import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Best Nolan film?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: "I'll start: Interstellar. Change my mind." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}