import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { isUUID } from 'class-validator';
import 'multer';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BlobService } from './blob.service';
import { DeleteBlobDto } from './dto/delete-blob.dto';
import { UploadBlobDto } from './dto/upload-blob.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blob')
export class BlobController {
  constructor(private readonly blobService: BlobService) {}

  @Roles(Role.ADMIN)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() { userId }: UploadBlobDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const result = await this.blobService.uploadFile(
      file.originalname,
      file.buffer,
      'public',
      userId,
    );
    return { message: 'Arquivo enviado com sucesso!', ...result };
  }

  @Roles(Role.ADMIN)
  @Get('list-all')
  async listAllFiles() {
    return this.blobService.listFiles();
  }

  @Roles(Role.ADMIN)
  @Get('list/:userId')
  async listFiles(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId should not be empty');
    }

    if (!isUUID(userId)) {
      throw new BadRequestException('userId should be a valid UUID');
    }

    return this.blobService.listUserFiles(userId);
  }

  @Roles(Role.MASTER)
  @Delete('delete')
  async deleteFile(@Body() payload: DeleteBlobDto) {
    return this.blobService.deleteFile(payload.url);
  }

  @Roles(Role.MASTER)
  @Delete('delete-all')
  async deleteAllFiles() {
    return this.blobService.deleteAllFiles();
  }
}
