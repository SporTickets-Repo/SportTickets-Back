import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlobModule } from './blob/blob.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, BlobModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
