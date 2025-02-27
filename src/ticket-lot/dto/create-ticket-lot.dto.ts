import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketLotDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'ticket-type-id' })
  ticketTypeId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'VIP Ticket Lot' })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 150.0 })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 100 })
  quantity: number;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-03-01T00:00:00.000Z' })
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-03-10T00:00:00.000Z' })
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true })
  isActive?: boolean;
}
