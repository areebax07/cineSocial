import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: 'moderator',
    enum: ['owner', 'moderator', 'member'],
    description: "'owner' transfers ownership; you become a moderator",
  })
  @IsString()
  @IsIn(['owner', 'moderator', 'member'])
  role: 'owner' | 'moderator' | 'member';
}