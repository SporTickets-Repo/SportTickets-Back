import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

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
  categoryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizedFieldDto)
  personalFields: PersonalizedFieldDto[];
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
}
