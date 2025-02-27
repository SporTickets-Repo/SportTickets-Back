import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTicketLotDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'ticket-type-id' })
  ticketTypeId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'VIP Ticket Lot Updated' })
  name?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 175.0 })
  price?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 80 })
  quantity?: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2025-03-02T00:00:00.000Z' })
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2025-03-11T00:00:00.000Z' })
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  isActive?: boolean;
}
