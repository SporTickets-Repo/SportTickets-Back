import { ApiProperty } from '@nestjs/swagger';
import { Restriction, UserType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTicketTypeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'event-id' })
  eventId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Ticket Type Name' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Ticket Type Description' })
  description: string;

  @IsOptional()
  @IsEnum(Restriction)
  @ApiProperty({ example: 'AGE' })
  restriction?: Restriction;

  @IsOptional()
  @IsEnum(UserType)
  @ApiProperty({ example: 'VIEWER' })
  userType?: UserType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  teamSize: number;
}
