import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'b3b8c9d0-1234-5678-9abc-def012345678', description: 'Review being commented on' })
  @IsUUID()
  reviewId: string;

  @ApiPropertyOptional({
    example: 'c4c9d0e1-2345-6789-abcd-ef0123456789',
    description: 'Parent comment UUID when replying (must belong to the same review)',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiProperty({ example: 'Totally agree, the ending hit hard.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}