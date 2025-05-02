import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SwaggerAuthMiddleware } from './common/middleware/swagger-auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://beta.sportickets.com.br',
      'https://spor-tickets-front.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerAuthMiddleware = new SwaggerAuthMiddleware();

  app.use('/api/docs', swaggerAuthMiddleware.use.bind(swaggerAuthMiddleware));

  const config = new DocumentBuilder()
    .setTitle('Sportickets')
    .setDescription('The Sportickets API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
