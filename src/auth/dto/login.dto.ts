import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'jonhdoe@example.com',
    description: 'User email, document or phone.',
  })
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'password', description: 'User password.' })
  password: string;
}
