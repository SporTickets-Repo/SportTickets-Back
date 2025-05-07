import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class PersonalizedFieldDto {
  @IsString()
  personalizedFieldId: string;

  @IsString()
  answer: string;
}

class PlayerDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizedFieldDto)
  @IsOptional()
  personalFields?: PersonalizedFieldDto[];
}

class TeamDto {
  @IsUUID()
  ticketTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  player: PlayerDto[];
}

class IdentificationDto {
  @IsString()
  type: string;

  @IsString()
  number: string;
}

class CardHolderDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => IdentificationDto)
  identification: IdentificationDto;
}

class CardDataDto {
  @IsString()
  cardNumber: string;

  @IsNumber()
  expirationMonth: number;

  @IsNumber()
  expirationYear: number;

  @IsString()
  securityCode: string;

  @IsNumber()
  installments: number;

  @IsString()
  @IsOptional()
  cardBrand: string;

  @ValidateNested()
  @Type(() => CardHolderDto)
  cardHolder: CardHolderDto;
}

class PaymentDataDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDataDto)
  cardData?: CardDataDto;
}

export class CreateCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamDto)
  teams: TeamDto[];

  @IsUUID()
  @IsOptional()
  couponId: string;

  @ValidateNested()
  @Type(() => PaymentDataDto)
  paymentData: PaymentDataDto;
}
