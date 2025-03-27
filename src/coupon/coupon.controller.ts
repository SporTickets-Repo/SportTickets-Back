import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UpdateCouponsListWrapperDto } from './dto/update-coupons-list';
import { UseCouponDto } from './dto/use-coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() body: CreateCouponDto) {
    if (body.percentage < 0 || body.percentage > 1) {
      throw new BadRequestException('Percentage must be between 0 and 1');
    }
    return this.couponService.createCoupon(body);
  }

  @Put('list/:id')
  @Roles(Role.PARTNER, Role.ADMIN)
  async updateCouponsList(
    @Param('id') eventId: string,
    @Body() payload: UpdateCouponsListWrapperDto,
    @Request() req: { user: User },
  ) {
    return this.couponService.updateCouponsList(
      req.user.id,
      eventId,
      payload.coupons,
    );
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
