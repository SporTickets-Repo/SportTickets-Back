import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @IsEnum(Role)
  @ApiProperty({
    example: Role.ADMIN,
    description: 'New role for the user',
  })
  role: Role;
}