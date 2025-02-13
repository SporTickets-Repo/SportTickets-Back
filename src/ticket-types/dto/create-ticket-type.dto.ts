import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { Restriction, UserType, Mode } from '@prisma/client';

export class CreateTicketTypeDto {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

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
