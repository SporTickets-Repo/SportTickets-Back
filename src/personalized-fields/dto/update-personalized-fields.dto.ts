import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePersonalizedFieldDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'ticket-type-id',
    description: 'ID of the associated TicketType',
  })
  ticketTypeId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'textarea',
    description: 'The type of the field',
  })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Provide additional details',
    description: 'The title of the request',
  })
  requestTitle?: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: { option1: 'Yes', option2: 'No' },
    description: 'Optional list of options',
  })
  optionsList?: any;
}
