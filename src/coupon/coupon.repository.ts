import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCouponDto) {
    return this.prisma.coupon.create({ data });
  }

  async update(id: string, data: UpdateCouponDto) {
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.coupon.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findValidCoupon(name: string, eventId: string) {
    return this.prisma.coupon.findFirst({
      where: {
        name,
        eventId,
        deletedAt: null,
        quantity: { gt: 0 },
      },
    });
  }

  async findCouponByNameAndEvent(name: string, eventId: string) {
    return this.prisma.coupon.findFirst({
      where: { name, eventId },
    });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
