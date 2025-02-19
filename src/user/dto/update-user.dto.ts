import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Lucas Rosa', description: 'User full name.' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '0584303139',
    description: 'User document (e.g., CPF).',
  })
  document?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'lucass@gmail.com', description: 'User email.' })
  email?: string;

  @IsOptional()
  @ApiProperty({ example: '1990-01-01', description: 'User date of birth.' })
  bornAt?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '12345-678', description: 'User postal code (CEP).' })
  cep?: string;

  @IsOptional()
  @IsEnum(Sex)
  @ApiProperty({
    example: 'MALE',
    description: 'User gender (MALE ou FEMALE).',
  })
  sex?: Sex;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '61995585555', description: 'User phone number.' })
  phone?: string;
}
