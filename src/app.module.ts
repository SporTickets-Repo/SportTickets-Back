import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, BlobModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
