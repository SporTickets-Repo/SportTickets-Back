import { ApiProperty } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ example: 'Lucas Rosa', description: 'User full name.' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @ApiProperty({
    example: '0584303139',
    description: 'User document (e.g., CPF).',
  })
  document?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'lucass@gmail.com', description: 'User email.' })
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '1990-01-01', description: 'User date of birth.' })
  bornAt?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ example: '12345-678', description: 'User postal code (CEP).' })
  cep?: string;

  @IsOptional()
  @IsEnum(Sex)
  @IsNotEmpty()
  @ApiProperty({
    example: 'MALE',
    description: 'User gender (MALE ou FEMALE).',
  })
  sex?: Sex;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @ApiProperty({ example: '61995585555', description: 'User phone number.' })
  phone?: string;
}
