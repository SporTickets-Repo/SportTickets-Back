import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsUUID()
  @IsOptional()
  @ApiProperty({
    example: 'w1dsa2e3-4r5t-6y7u-8i9o-0p0a1s2d3f4',
    description: 'Ticket type id',
  })
  ticketTypeId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Category 1', description: 'Category title' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Category description',
    description: 'Category description',
  })
  description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 100, description: 'Category quantity' })
  quantity?: number;
}
