import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class EventIdParamDto {
  @ApiProperty({
    example: '2ed7107d-d5cf-45d7-9ee7-108a308b826d',
    description: 'ID of the event',
  })
  @IsUUID()
  eventId: string;
}
