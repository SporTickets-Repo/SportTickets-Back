import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBracketDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'event123',
    description: 'ID of the related event',
  })
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Bracket Name',
    description: 'Name of the bracket',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'bracket-name',
    description: 'URL of the bracket',
  })
  url: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: true,
    description: 'Defines if the bracket is active',
  })
  isActive?: boolean;
}
