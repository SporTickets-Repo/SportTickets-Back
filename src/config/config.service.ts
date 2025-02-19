import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get blobToken(): string {
    return this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';
  }

  get zeptoMailToken(): string {
    return this.configService.get<string>('ZEPTOMAIL_TOKEN') || '';
  }
}
