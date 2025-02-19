import { Module } from '@nestjs/common';
import { AppConfigService } from 'src/config/config.service';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService, AppConfigService],
  exports: [EmailService],
})
export class EmailModule {}
