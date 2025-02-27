import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePersonalizedFieldDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'ticket-type-id',
    description: 'ID of the associated TicketType',
  })
  ticketTypeId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'text',
    description: 'The type of the field (e.g. text, textarea, select)',
  })
  type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Enter your custom message',
    description: 'The title of the request for this field',
  })
  requestTitle: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: { option1: 'Yes', option2: 'No' },
    description: 'Optional list of options for select type fields',
  })
  optionsList?: any;
}
