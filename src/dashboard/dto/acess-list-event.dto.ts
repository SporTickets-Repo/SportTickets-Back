import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AccessListEventDto {
  @ApiProperty({
    example: ['2ed7107d-d5cf-45d7-9ee7-108a308b826d'],
    description: 'Array of user IDs (UUID)',
    type: [String],
  })
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @ApiProperty({
    example: '2ed7107d-d5cf-45d7-9ee7-108a308b826d',
    description: 'ID of the event (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}
