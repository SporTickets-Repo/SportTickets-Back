import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Sportickets event',
    description: 'Name of the event',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'event-name',
    description: 'Name of the event that will be used in the URL',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Event place',
    description: 'Google Maps location of the event',
  })
  place: string;

  @IsString()
  @Matches(/^\d{8}$/, {
    message: 'CEP must be a valid format',
  })
  @IsNotEmpty()
  @ApiProperty({
    example: '72509000',
    description: 'CEP of the event',
  })
  cep: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Volleyball event',
    description: 'Title of the event',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Event of the year',
    description: 'Description of the event',
  })
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event regulation',
    description: 'Regulation of the event',
  })
  regulation?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Event additional info',
    description: 'Additional information about the event',
  })
  additionalInfo?: string;

  bannerUrl?: string | null;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Start date of the event',
  })
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'End date of the event',
  })
  endDate: Date;
}
