import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { BracketModule } from './bracket/bracket.module';
import { CategoryModule } from './category/category.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CouponModule } from './coupon/coupon.module';
import { CronJobsModule } from './cron-job/cron-job.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';
import { PersonalizedFieldsModule } from './personalized-fields/personalized-fields.module';
import { PrismaService } from './prisma/prisma.service';
import { RankingModule } from './ranking/ranking.module';
import { TicketLotModule } from './ticket-lot/ticket-lot.module';
import { TicketTypeModule } from './ticket-types/ticket-types.module';
import { TicketModule } from './ticket/ticket.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';

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
    CheckoutModule,
    RankingModule,
    PaymentModule,
    TransactionModule,
    TicketModule,
    ScheduleModule.forRoot(),
    CronJobsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
