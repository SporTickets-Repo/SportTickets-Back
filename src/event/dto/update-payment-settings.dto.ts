import { ApiProperty } from '@nestjs/swagger';
import { Country, Currency, PaymentMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdatePaymentSettingsDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  eventFee: number;

  @IsEnum(Country)
  @ApiProperty({
    example: Country.BRAZIL,
    description: 'País onde o evento está localizado',
  })
  @IsOptional()
  country: Country;

  @IsOptional()
  @IsEnum(PaymentMethod, { each: true })
  @ApiProperty({
    example: [PaymentMethod.CREDIT_CARD],
    description: 'Métodos de pagamento aceitos',
    required: false,
    enum: PaymentMethod,
    isArray: true,
  })
  paymentMethods?: PaymentMethod[];

  @ApiProperty({
    example: Currency.BRL,
    description: 'Moeda utilizada para transações',
  })
  @IsEnum(Currency)
  currency: Currency;
}
