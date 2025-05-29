import { ApiProperty } from '@nestjs/swagger';
import { Country, Sex } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'John Doe', description: 'User full name.' })
  name: string;

  @IsOptional()
  @ValidateIf((o) => o.country === Country.BRAZIL)
  @IsString()
  document?: string;

  @IsString()
  @IsNotEmpty()
  country: Country;

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
