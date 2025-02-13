import { ApiProperty } from '@nestjs/swagger';
import { Mode, Restriction, UserType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'event-id' })
  eventId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ticket Type Name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Ticket Type Description' })
  description?: string;

  @IsOptional()
  @IsEnum(Restriction)
  @ApiProperty({ example: 'AGE' })
  restriction?: Restriction;

  @IsOptional()
  @IsEnum(UserType)
  @ApiProperty({ example: 'VIEWER' })
  userType?: UserType;

  @IsOptional()
  @IsEnum(Mode)
  @ApiProperty({ example: 'SOLO' })
  mode?: Mode;
}
