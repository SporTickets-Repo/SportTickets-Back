import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { EventModule } from './event/event.module';
import { PrismaService } from './prisma/prisma.service';
import { TicketTypeModule } from './ticket-types/ticket-types.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    AuthModule,
    BlobModule,
    EventModule,
    UserModule,
    TicketTypeModule,
    BlobModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
