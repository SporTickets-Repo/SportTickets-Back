import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'test@example.com',
    description: 'The e-mail to be checked if it is already taken',
  })
  email: string;
}
