import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * DTO principal para o objeto "event"
 */
export class EventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsDateString(undefined, { message: 'startDate deve ser uma data válida' })
  startDate: string;

  @IsNotEmpty()
  @IsDateString(undefined, { message: 'endDate deve ser uma data válida' })
  endDate: string;

  @IsNotEmpty()
  @MinLength(15, { message: 'A descrição deve ter no mínimo 15 caracteres' })
  description: string;

  @IsNotEmpty()
  @MinLength(15, { message: 'O regulamento deve ter no mínimo 15 caracteres' })
  regulation: string;

  @IsNotEmpty()
  @MinLength(15, {
    message: 'As informações adicionais devem ter no mínimo 15 caracteres',
  })
  additionalInfo: string;

  @IsNotEmpty()
  @Matches(/^\d{5}-\d{3}$/, {
    message: 'O CEP deve estar no formato 12345-678',
  })
  cep: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  street: string;

  @IsOptional()
  addressNumber?: string;

  @IsOptional()
  complement?: string;

  @IsNotEmpty()
  neighborhood: string;

  @IsNotEmpty()
  place: string;

  // Este array pode ser string[] ou conforme precisar
  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  /**
   * Estes dois campos não virão em JSON; chegarão como arquivos.
   * Vamos apenas deixá-los no DTO para referência.
   */
  bannerImageFile?: Express.Multer.File;
  smallImageFile?: Express.Multer.File;
}

/**
 * Exemplo de DTO para um "TicketType".
 */
export class TicketTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // outros campos, ex.:
  @IsOptional()
  description?: string;

  // ...
}

/**
 * Exemplo de DTO para "Coupon".
 */
export class CouponDto {
  @IsNotEmpty()
  @IsString()
  couponName: string;

  // ... etc
}

/**
 * Exemplo de DTO para "Collaborator".
 */
export class CollaboratorDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

/**
 * DTO de nível superior para agrupar tudo que
 * você está enviando no seu form (event, ticketTypes, etc).
 */
export class CreateFullEventDto {
  @ValidateNested()
  @Type(() => EventDto)
  event: EventDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTypeDto)
  ticketTypes?: TicketTypeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponDto)
  coupons?: CouponDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollaboratorDto)
  collaborators?: CollaboratorDto[];
}
