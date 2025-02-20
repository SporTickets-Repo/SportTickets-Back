import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: 'w1dsa2e3-4r5t-6y7u-8i9o-0p0a1s2d3f4',
    description: 'Ticket type id',
  })
  ticketTypeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Category 1', description: 'Category title' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Category description',
    description: 'Category description',
  })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 100, description: 'Category quantity' })
  quantity: number;
}
