import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  providers: [PaymentService, MercadoPagoGateway],
  exports: [PaymentService],
})
export class PaymentModule {}
