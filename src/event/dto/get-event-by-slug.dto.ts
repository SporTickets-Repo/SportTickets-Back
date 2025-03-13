import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetEventBySlugDto {
  @ApiProperty({ example: 'event-name' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  slug: string;
}
