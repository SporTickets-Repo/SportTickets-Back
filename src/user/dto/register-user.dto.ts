import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'User full name.' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '123.456.789-00', description: 'User document.' })
  document: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com', description: 'User email.' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: '1990-01-01', description: 'User date of birth.' })
  bornAt: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '12345-123', description: 'User postal code.' })
  cep: string;

  @IsNotEmpty()
  @IsString()
  sex: Sex;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '12345678900', description: 'User phone number.' })
  phone: string;
}
