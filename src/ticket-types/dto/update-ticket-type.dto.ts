import { Mode, Restriction, UserType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Restriction)
  restriction?: Restriction;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @IsOptional()
  @IsEnum(Mode)
  mode?: Mode;
}
