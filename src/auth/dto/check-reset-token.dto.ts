import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CheckResetTokenDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The token to be checked if it is valid',
  })
  token: string;
}
