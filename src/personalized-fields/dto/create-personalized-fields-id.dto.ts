import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PersonalizedFieldsIdParamDto {
  @IsUUID()
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
    description: 'PersonalizedFields unique identifier',
  })
  id: string;
}
