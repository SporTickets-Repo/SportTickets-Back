import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { CheckoutModule } from 'src/checkout/checkout.module';
import { AppConfigModule } from 'src/config/config.module';
import { MercadoPagoGateway } from './gateway/mercado-pago-gateway.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule, AppConfigModule, forwardRef(() => CheckoutModule)],
  providers: [PaymentService, MercadoPagoGateway],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
