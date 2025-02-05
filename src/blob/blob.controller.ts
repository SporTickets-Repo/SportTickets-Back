import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { BlobService } from './blob.service';
import { DeleteBlobDto } from './dto/delete-blob.dto';

@Controller('blob')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const result = await this.blobService.uploadFile(
      file.originalname,
      file.buffer,
      'public',
    );
    return { message: 'Arquivo enviado com sucesso!', ...result };
  }

  @Get('list')
  async listFiles() {
    return this.blobService.listFiles();
  }

  @Delete('delete')
  async deleteFile(@Body() payload: DeleteBlobDto) {
    return this.blobService.deleteFile(payload.url);
  }
}
