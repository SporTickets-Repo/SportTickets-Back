import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBracketDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Updated Bracket Name',
    description: 'Updated name of the bracket',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'updated-bracket-name',
    description: 'Updated URL of the bracket',
  })
  url?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: false,
    description: 'Updated status of the bracket',
  })
  isActive?: boolean;
}
