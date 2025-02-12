import { IsNotEmpty, IsUUID } from 'class-validator';

export class UploadBlobDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
