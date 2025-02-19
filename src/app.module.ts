import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { EventModule } from './event/event.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, BlobModule, EventModule, UserModule, BlobModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
