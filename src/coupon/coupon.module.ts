import { Module } from '@nestjs/common';
import { EventModule } from 'src/event/event.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CouponController } from './coupon.controller';
import { CouponRepository } from './coupon.repository';
import { CouponService } from './coupon.service';

@Module({
  imports: [EventModule],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, PrismaService],
})
export class CouponModule {}
