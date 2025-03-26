import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UseCouponDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Coupon Name',
    description: 'Name of the coupon  to use',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'event123',
    description: 'ID of the related event',
  })
  eventId: string;
}
