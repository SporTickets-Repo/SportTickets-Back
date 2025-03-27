import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UpdateRankingListDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class UpdateRankingListWrapperDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRankingListDto)
  rankings: UpdateRankingListDto[];
}
