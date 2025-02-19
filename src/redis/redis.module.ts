import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AppConfigService } from 'src/config/config.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (appConfigService: AppConfigService) => {
        return new Redis({
          host: appConfigService.redisHost,
          port: appConfigService.redisPort,
          password: appConfigService.redisPassword,
          db: appConfigService.redisDB,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
