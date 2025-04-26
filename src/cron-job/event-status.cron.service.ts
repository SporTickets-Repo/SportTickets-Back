import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventStatusCronService {
  private readonly logger = new Logger(EventStatusCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    this.logger.log('🎯 Cron job EXECUTOU');
    const now = new Date();
    const nowFormatted = now.toISOString();

    this.logger.log(
      `Iniciando verificação de status de eventos — ${nowFormatted}`,
    );

    const progressResult = await this.prisma.event.updateMany({
      where: {
        status: EventStatus.REGISTRATION,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      data: {
        status: EventStatus.PROGRESS,
      },
    });

    const finishedResult = await this.prisma.event.updateMany({
      where: {
        status: EventStatus.PROGRESS,
        endDate: { lt: now },
      },
      data: {
        status: EventStatus.FINISHED,
      },
    });

    this.logger.log(
      `→ Eventos atualizados para PROGRESS: ${progressResult.count}`,
    );

    this.logger.log(
      `→ Eventos atualizados para FINISHED: ${finishedResult.count}`,
    );

    this.logger.log(`Verificação concluída — ${new Date().toISOString()}`);
  }
}
