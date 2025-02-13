import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class DeleteBlobDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'https://t96kpt9nk5xvwlvg.public.blob.vercel-storage.com/b8ee9109-bddc-4b74-9306-ce714714edba/matcap-FVpfQJCMgEuRcajTJ7W9tJMU05p0yX.png',
    description: 'Blob File URL',
  })
  url: string;
}
