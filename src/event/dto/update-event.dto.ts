import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Sportickets event',
    description: 'Name of the event',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'event-name',
    description: 'Name of the event that will be used in the URL',
    required: false,
  })
  slug?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event place',
    description: 'Google Maps location of the event',
    required: false,
  })
  place?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Volleyball event',
    description: 'Title of the event',
    required: false,
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event of the year',
    description: 'Description of the event',
    required: false,
  })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event regulation',
    description: 'Regulation of the event',
    required: false,
  })
  regulation?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event additional info',
    description: 'Additional information about the event',
    required: false,
  })
  additionalInfo?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'www.imageexample.com/image',
    description: 'URL of the event banner',
    required: false,
  })
  bannerUrl?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Start date of the event',
    required: false,
  })
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'End date of the event',
    required: false,
  })
  endDate?: string;
}
