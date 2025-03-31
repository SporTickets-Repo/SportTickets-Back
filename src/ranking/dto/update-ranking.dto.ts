import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRankingDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Updated Ranking Name', description: 'Updated name' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'updated-ranking-name', description: 'Updated URL' })
  url?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false, description: 'Updated active status' })
  isActive?: boolean;
}
