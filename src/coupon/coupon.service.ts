import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponRepository } from './coupon.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UseCouponDto } from './dto/use-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async createCoupon(data: CreateCouponDto) {
    if (data.percentage < 0 || data.percentage > 1) {
      throw new BadRequestException('Percentage must be between 0 and 1');
    }

    const existingCoupon = await this.couponRepository.findCouponByNameAndEvent(
      data.name,
      data.eventId,
    );
    if (existingCoupon) {
      throw new ConflictException('Coupon name already exists for this event');
    }

    const userExists = await this.couponRepository.findUserById(data.createdBy);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.couponRepository.create(data);
  }

  async updateCoupon(id: string, data: UpdateCouponDto) {
    return this.couponRepository.update(id, data);
  }

  async deleteCoupon(id: string) {
    return this.couponRepository.softDelete(id);
  }

  async validateCoupon({ name, eventId }: UseCouponDto) {
    const coupon = await this.couponRepository.findValidCoupon(name, eventId);
    if (!coupon) {
      throw new NotFoundException('Invalid or expired coupon');
    }

    return {
      id: coupon.id,
      name: coupon.name,
      percentage: coupon.percentage,
    };
  }
}
