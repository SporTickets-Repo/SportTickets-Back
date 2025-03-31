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

export class UpdateBracketListDto {
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

export class UpdateBracketListWrapperDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBracketListDto)
  brackets: UpdateBracketListDto[];
}
