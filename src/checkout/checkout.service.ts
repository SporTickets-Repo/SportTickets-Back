import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Transaction, User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PaymentService } from '../payment/payment.service';
import { CheckoutRepository } from './checkout.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { MercadoPagoPaymentResponse } from './dto/mercado-pago-payment-response';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(dto: CreateCheckoutDto, user: User) {
    const checkoutResult = await this.checkoutRepository.performCheckout(
      dto,
      user,
    );

    console.log('checkoutResult', checkoutResult);

    if (!checkoutResult) {
      throw new InternalServerErrorException(
        'Erro ao criar a transação de checkout',
      );
    }

    const paymentResult = await this.paymentService.processPayment(
      checkoutResult,
      dto,
    );

    if (!paymentResult) {
      throw new InternalServerErrorException('Erro ao processar o pagamento');
    }

    return {
      transactionId: checkoutResult.id,
      message: 'Transaction created successfully',
    };
  }

  async handleApprovedTransaction(transactionData: Transaction) {
    const transaction =
      await this.checkoutRepository.getTransactionWithTicketsByPaymentId(
        transactionData.id,
      );

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    for (const ticket of transaction.tickets) {
      await this.emailService.sendTicketConfirmation(ticket);
    }
  }

  async updatePaymentStatus(gatewayResponse: MercadoPagoPaymentResponse) {
    return await this.checkoutRepository.updateCheckoutTransaction(
      gatewayResponse,
    );
  }
}
