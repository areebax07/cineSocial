import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'areeba@cinesocial.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'areeba123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Areeba Zafar' })
  @IsString()
  @IsNotEmpty()
  displayName: string;
}