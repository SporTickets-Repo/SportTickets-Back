import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development teste';
  }

  get s3Bucket(): string {
    return this.configService.get<string>('S3_BUCKET')!;
  }

  get s3AccessKeyId(): string {
    return this.configService.get<string>('S3_ACCESS_KEY_ID')!;
  }

  get s3SecretAccessKey(): string {
    return this.configService.get<string>('S3_SECRET_ACCESS_KEY')!;
  }

  get redisUrl(): string {
    return this.configService.get<string>('REDIS_URL') || '';
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

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || '';
  }

  get mercadoPagoToken(): string {
    return this.configService.get<string>('MP_ACCESS_TOKEN') || '';
  }

  get backendUrl(): string {
    return this.configService.get<string>('BACKEND_URL') || '';
  }
}
