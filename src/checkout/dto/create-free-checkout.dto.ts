import { Type } from 'class-transformer';
import {
  IsArray,
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
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizedFieldDto)
  @IsOptional()
  personalFields?: PersonalizedFieldDto[];
}

export class TermsDto {
  @IsUUID()
  termId: string;
}
export class TeamDto {
  @IsUUID()
  ticketTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  player: PlayerDto[];
}

export class CreateFreeCheckoutDto {
  @ValidateNested()
  @Type(() => TeamDto)
  team: TeamDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TermsDto)
  @IsOptional()
  terms?: TermsDto[];
}
