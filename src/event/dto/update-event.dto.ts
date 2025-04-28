import { ApiProperty } from '@nestjs/swagger';
import {
  EventLevel,
  EventStatus,
  EventType,
  PaymentMethod,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AddressEventDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '12345-678',
    description: 'Código postal',
    required: false,
  })
  zipCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Rua Principal',
    description: 'Nome da rua',
    required: false,
  })
  street?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Apto 101',
    description: 'Complemento do endereço',
    required: false,
  })
  complement?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123',
    description: 'Número',
    required: false,
  })
  number?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Centro',
    description: 'Bairro',
    required: false,
  })
  neighborhood?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Cidade Exemplo',
    description: 'Cidade',
    required: false,
  })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Estado Exemplo',
    description: 'Estado',
    required: false,
  })
  state?: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Sportickets event',
    description: 'Nome do evento',
    required: false,
  })
  name?: string;

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'event-name',
    description: 'Slug do evento',
    required: false,
  })
  slug: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Local do evento',
    description: 'Localização do evento',
    required: false,
  })
  place?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Descrição do evento',
    description: 'Descrição do evento',
    required: false,
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Regulamento do evento',
    description: 'Regulamento do evento',
    required: false,
  })
  regulation?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: 'true',
    description: 'Permitir contagem total de ingresso',
    required: false,
  })
  allowFullTickets?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'Permitir contagem por tipo de ingressos',
    required: false,
  })
  allowIndividualTickets?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Informações adicionais sobre o evento',
    description: 'Informações adicionais sobre o evento',
    required: false,
  })
  additionalInfo?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de início do evento',
    required: false,
  })
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Data de término do evento',
    required: false,
  })
  endDate?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  @ApiProperty({
    example: EventStatus.DRAFT,
    description: 'Status do evento',
    required: false,
    enum: EventStatus,
  })
  status?: EventStatus;

  @IsEnum(EventType)
  @IsOptional()
  @ApiProperty({
    example: EventType.GENERAL,
    description: 'Tipo do evento',
    required: false,
    enum: EventType,
  })
  type?: EventType;

  @IsEnum(EventLevel)
  @IsOptional()
  @ApiProperty({
    example: EventLevel.GENERAL,
    description: 'Nível do evento',
    required: false,
    enum: EventLevel,
  })
  level?: EventLevel;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressEventDto)
  @ApiProperty({
    description: 'Endereço do evento',
    required: false,
    type: AddressEventDto,
  })
  address?: AddressEventDto;
}
