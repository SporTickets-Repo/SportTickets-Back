import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { BracketModule } from './bracket/bracket.module';
import { CategoryModule } from './category/category.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventModule } from './event/event.module';
import { PrismaService } from './prisma/prisma.service';
import { TicketTypeModule } from './ticket-types/ticket-types.module';
import { UserModule } from './user/user.module';
import { PersonalizedFieldsModule } from './personalized-fields/personalized-fields.module';

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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
