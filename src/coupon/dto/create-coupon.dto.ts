import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Coupon Name',
    description: 'Name of the coupon',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'event123',
    description: 'ID of the related event',
  })
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user123',
    description: 'ID of the user who created the coupon',
  })
  createdBy: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 10,
    description: 'Percentage of the coupon',
  })
  percentage: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    description: 'Quantity of the coupon',
  })
  quantity: number;
}
