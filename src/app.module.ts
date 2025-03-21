import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { BracketModule } from './bracket/bracket.module';
import { CategoryModule } from './category/category.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventModule } from './event/event.module';
import { PersonalizedFieldsModule } from './personalized-fields/personalized-fields.module';
import { PrismaService } from './prisma/prisma.service';
import { TicketLotModule } from './ticket-lot/ticket-lot.module';
import { TicketTypeModule } from './ticket-types/ticket-types.module';
import { UserModule } from './user/user.module';
import { NestController } from './coupon/nest/nest.controller';
import { CouponService } from './coupon/coupon.service';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [
    AuthModule,
    BlobModule,
    EventModule,
    UserModule,
    TicketTypeModule,
    BlobModule,
    BracketModule,
    CategoryModule,
    DashboardModule,
    PersonalizedFieldsModule,
    TicketLotModule,
    CouponModule,
  ],
  controllers: [NestController],
  providers: [PrismaService, CouponService],
})
export class AppModule {}
