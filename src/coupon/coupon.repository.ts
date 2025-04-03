import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UpdateCouponsListDto } from './dto/update-coupons-list';

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
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        name,
        eventId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!coupon) return null;

    if (coupon.soldQuantity >= coupon.quantity) return null;

    return coupon;
  }

  async findCouponByNameAndEvent(name: string, eventId: string) {
    return this.prisma.coupon.findFirst({
      where: { name, eventId, deletedAt: null },
    });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findAllByEvent(eventId: string) {
    return this.prisma.coupon.findMany({
      where: {
        eventId,
        deletedAt: null,
      },
    });
  }

  async updateCouponsList(
    userId: string,
    eventId: string,
    coupons: UpdateCouponsListDto[],
  ) {
    const now = new Date();

    const validCoupons = coupons.filter((c): c is UpdateCouponsListDto => !!c);

    const existingCoupons = await this.findAllByEvent(eventId);
    const existingIds = existingCoupons.map((c) => c.id);

    const incomingIds = validCoupons
      .filter((c): c is UpdateCouponsListDto => !!c.id)
      .map((c) => c.id);

    const toDelete = existingCoupons.filter((c) => !incomingIds.includes(c.id));

    return this.prisma.$transaction([
      ...toDelete.map((coupon) =>
        this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { deletedAt: now, isActive: false },
        }),
      ),

      ...validCoupons.map((coupon) => {
        if (coupon.id && existingIds.includes(coupon.id)) {
          return this.prisma.coupon.update({
            where: { id: coupon.id },
            data: {
              name: coupon.name,
              percentage: coupon.percentage,
              quantity: coupon.quantity,
              isActive: coupon.isActive,
            },
          });
        } else {
          return this.prisma.coupon.create({
            data: {
              name: coupon.name,
              percentage: coupon.percentage,
              quantity: coupon.quantity,
              eventId,
              createdBy: userId,
              isActive: coupon.isActive,
            },
          });
        }
      }),
    ]);
  }
}
