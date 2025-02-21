import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AccessEventDto {
  @ApiProperty({
    example: '2ed7107d-d5cf-45d7-9ee7-108a308b826d',
    description: 'ID of the user',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '2ed7107d-d5cf-45d7-9ee7-108a308b826d',
    description: 'ID of the event',
  })
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}
