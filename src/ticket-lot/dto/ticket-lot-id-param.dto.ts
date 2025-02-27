import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TicketLotIdParamDto {
  @IsUUID()
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'TicketLot unique identifier',
  })
  id: string;
}
