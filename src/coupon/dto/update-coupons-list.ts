import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateCouponsListDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0.01)
  @Max(1)
  percentage: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class UpdateCouponsListWrapperDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCouponsListDto)
  coupons: UpdateCouponsListDto[];
}
