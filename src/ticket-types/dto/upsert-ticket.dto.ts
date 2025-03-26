import { Restriction, UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CategoryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'O título da categoria é obrigatório' })
  title: string;

  @IsInt()
  @Min(0, { message: 'A quantidade deve ser um número inteiro não negativo' })
  quantity: number;

  @IsOptional()
  @IsEnum(Restriction, { message: 'Restrição inválida' })
  restriction?: Restriction;
}

export class PersonalizedFieldDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'O título da requisição é obrigatório' })
  question: string; // in your schema, it was "requestTitle" in Prisma?

  @IsString()
  @IsNotEmpty({ message: 'O tipo do campo é obrigatório' })
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionsList?: string[];
}

export class TicketLotDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do lote de ingressos é obrigatório' })
  name: string;

  @IsNumber({}, { message: 'O preço deve ser um número (não negativo)' })
  @Min(0, { message: 'O preço deve ser não negativo' })
  price: number;

  @IsInt()
  @Min(0, { message: 'A quantidade deve ser um número inteiro não negativo' })
  quantity: number;

  @IsString()
  @IsNotEmpty({
    message: 'A data de início do lote de ingressos é obrigatória',
  })
  startDate: string;

  @IsString()
  @IsNotEmpty({
    message: 'A data de término do lote de ingressos é obrigatória',
  })
  endDate: string;

  @IsBoolean()
  isActive: boolean;
}

export class UpsertTicketTypeDto {
  @IsOptional()
  @IsString()
  id?: string; // If you want to update an existing TicketType by ID

  @IsString()
  @IsNotEmpty({ message: 'O nome do tipo de ingresso é obrigatório' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Restriction, { message: 'Restrição inválida' })
  restriction?: Restriction;

  @IsEnum(UserType, {
    message: 'O tipo de usuário deve ser ATHLETE ou VIEWER',
  })
  userType: UserType;

  @IsInt()
  @Min(1, { message: 'O tamanho do time deve ser no mínimo 1' })
  teamSize: number;

  @IsInt()
  @Min(1, { message: 'A quantidade deve ser no mínimo 1' })
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories?: CategoryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizedFieldDto)
  personalizedFields?: PersonalizedFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketLotDto)
  ticketLots?: TicketLotDto[];
}
