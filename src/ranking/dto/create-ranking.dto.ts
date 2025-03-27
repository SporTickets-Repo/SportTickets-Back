import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRankingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'event123', description: 'ID of the related event' })
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ranking Name', description: 'Name of the ranking' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'ranking-name', description: 'URL of the ranking' })
  url: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'Defines if the ranking is active',
  })
  isActive?: boolean;
}
