import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get blobToken(): string {
    return this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  get redisDB(): number {
    return this.configService.get<number>('REDIS_DB', 0);
  }

  get zeptoMailToken(): string {
    return this.configService.get<string>('ZEPTOMAIL_TOKEN') || '';
  }
}
