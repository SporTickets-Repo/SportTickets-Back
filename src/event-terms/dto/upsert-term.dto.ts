import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UpsertTermDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  title: string;

  @IsBoolean()
  isObligatory: boolean;
}

export class SyncEventTermsDto {
  @ValidateNested({ each: true })
  @Type(() => UpsertTermDto)
  terms: UpsertTermDto[];
}
