import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() body: CreateCouponDto) {
    if (body.percentage < 0 || body.percentage > 1) {
      throw new BadRequestException('Percentage must be between 0 and 1');
    }
    return this.couponService.createCoupon(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCouponDto) {
    return this.couponService.updateCoupon(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  @Post('use')
  useCoupon(@Body() body: UseCouponDto) {
    return this.couponService.validateCoupon(body);
  }

  @Get('event/:eventId')
  getCouponsByEvent(@Param('eventId') eventId: string) {
    return this.couponService.getCouponsByEvent(eventId);
  }
}
