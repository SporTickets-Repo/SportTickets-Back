import { Module } from '@nestjs/common';
import { BlobService } from 'src/blob/blob.service';
import { AppConfigModule } from 'src/config/config.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [AppConfigModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, UserRepository, BlobService],
})
export class UserModule {}
