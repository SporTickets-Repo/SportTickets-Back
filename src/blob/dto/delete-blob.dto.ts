import { IsNotEmpty, IsUrl } from 'class-validator';

export class DeleteBlobDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
