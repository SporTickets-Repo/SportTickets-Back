import { Type } from 'class-transformer';
import {
  IsArray,
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
  categoryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizedFieldDto)
  personalFields: PersonalizedFieldDto[];
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
  cardBrand: string;

  @ValidateNested()
  @Type(() => CardHolderDto)
  cardHolder: CardHolderDto;
}

class PaymentDataDto {
  @IsString()
  paymentMethod: string;

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
