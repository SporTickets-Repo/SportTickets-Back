import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PersonalizedFieldController } from './personalized-fields.controller';
import { PersonalizedFieldRepository } from './personalized-fields.repository';
import { PersonalizedFieldService } from './personalized-fields.service';

@Module({
  controllers: [PersonalizedFieldController],
  providers: [
    PersonalizedFieldService,
    PersonalizedFieldRepository,
    PrismaService,
  ],
})
export class PersonalizedFieldsModule {}
