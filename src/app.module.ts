import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { PrismaService } from './prisma/prisma.service';
import { EventModule } from './event/event.module';

@Module({
  imports: [AuthModule, BlobModule, EventModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
