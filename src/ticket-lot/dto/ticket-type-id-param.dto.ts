import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TicketTypeIdParamDto {
  @IsUUID()
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
    description: 'TicketType unique identifier',
  })
  ticketTypeId: string;
}
