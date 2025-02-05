import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/config.service';
import { BlobController } from './blob.controller';
import { BlobService } from './blob.service';

@Module({
  imports: [AppConfigModule],
  controllers: [BlobController],
  providers: [BlobService, AppConfigService],
  exports: [BlobService],
})
export class BlobModule {}
