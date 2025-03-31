import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule],
  providers: [PaymentService, MercadoPagoGateway],
  exports: [PaymentService],
})
export class PaymentModule {}
