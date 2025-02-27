import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetAllEventsDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
