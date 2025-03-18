// src/events/dto/filter-events.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterEventsDto {
  @ApiPropertyOptional({
    description: 'Nome do evento para busca parcial',
    example: 'Campeonato',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Data inicial (ISO DateTime)',
    example: '2025-01-01T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Preço mínimo', example: 50 })
  @IsOptional()
  @IsNumberString()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Preço máximo', example: 200 })
  @IsOptional()
  @IsNumberString()
  maxPrice?: number;
}
