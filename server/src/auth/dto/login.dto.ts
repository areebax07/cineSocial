import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'areeba@cinesocial.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'areeba123' })
  @IsString()
  @MinLength(6)
  password: string;
}