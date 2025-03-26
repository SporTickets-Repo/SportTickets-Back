import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Coupon Name Updated',
    description: 'Name of the coupon',
  })
  name?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 10,
    description: 'Percentage of the coupon',
  })
  percentage?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 100,
    description: 'Quantity of the coupon',
  })
  quantity?: number;
}
